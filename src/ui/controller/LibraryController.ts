import createLayout from 'justified-layout'

import { profileLibraryLayout, profileThumbnailRenderer } from '../../common/LogConstants'
import { PhotoSectionId, PhotoSectionById, PhotoSection, PhotoType } from '../../common/models/Photo'
import CancelablePromise, { isCancelError } from '../../common/util/CancelablePromise'
import Profiler from '../../common/util/Profiler'
import SerialJobQueue from '../../common/util/SerialJobQueue'

import { fetchSectionPhotos as fetchSectionPhotosFromDb } from '../BackgroundClient'
import { GridSectionLayout } from '../UITypes'
import { sectionHeadHeight } from '../components/library/GridSection'
import { forgetSectionPhotosAction, fetchSectionPhotosAction } from '../state/actions'
import store from '../state/store'
import { getThumbnailSrc, createThumbnail as createThumbnailOnDisk } from './ImageProvider'


const pagesToKeep = 4
const pagesToPreload = 3
const targetRowHeight = 320  // Default of 'justified-layout'
const averageAspect = 3 / 2

let prevSectionIds: PhotoSectionId[] = []
let prevSectionById: PhotoSectionById = {}
let prevSectionLayouts: GridSectionLayout[] = []
let prevScrollTop = 0
let prevViewportWidth = 0
let prevViewportHeight = 0

let isFetchingSectionPhotos = false


export function getLayoutForSections(sectionIds: PhotoSectionId[], sectionById: PhotoSectionById,
    scrollTop: number, viewportWidth: number, viewportHeight: number):
    GridSectionLayout[]
{
    const profiler = profileLibraryLayout ? new Profiler(`Calculating layout for ${sectionIds.length} sections`) : null

    let sectionLayouts: GridSectionLayout[] = []
    const prevLayoutIsDirty = (viewportWidth !== prevViewportWidth)

    let sectionIdsToProtect: { [index: string]: true }
    let sectionIdsToForget: { [index: string]: true } = null
    let sectionIdToLoad: PhotoSectionId | null = null
    let sectionIdToLoadDistance = Number.POSITIVE_INFINITY

    const isScrollingDown = (scrollTop >= prevScrollTop)
    const keepMinY = scrollTop - pagesToKeep * viewportHeight
    const keepMaxY = scrollTop + (pagesToKeep + 1) * viewportHeight
    const preloadMinY = scrollTop - (isScrollingDown ? 0 : pagesToPreload) * viewportHeight
    const preloadMaxY = scrollTop + ((isScrollingDown ? pagesToPreload : 0) + 1) * viewportHeight

    const sectionCount = sectionIds.length
    let sectionTop = 0
    for (let sectionIndex = 0; sectionIndex < sectionCount; sectionIndex++) {
        const sectionId = sectionIds[sectionIndex]
        const section = sectionById[sectionId]

        // -- Update section layout --

        const usePlaceholder = !section.photoIds
        const prevLayout = (
                !prevLayoutIsDirty
                && section === prevSectionById[prevSectionIds[sectionIndex]]
                    // We have to compare sections, not section IDs in order to detect changes inside the section.
                    // See `createLayoutForLoadedSection`
            ) ? prevSectionLayouts[sectionIndex] : null

        let layout: GridSectionLayout
        if (prevLayout) {
            const prevLayoutIsPlaceholder = !prevLayout.boxes
            if (usePlaceholder == prevLayoutIsPlaceholder) {
                layout = prevLayout
            }
        }

        if (!layout) {
            // We have to update the layout
            if (usePlaceholder) {
                if (prevLayout) {
                    // Drop boxes
                    layout = { sectionTop, containerHeight: prevLayout.containerHeight }
                } else if (viewportWidth === 0) {
                    layout = { sectionTop, containerHeight: section.count * targetRowHeight }
                } else {
                    // Estimate section height (assuming a normal landscape aspect ratio of 3:2)
                    const unwrappedWidth = averageAspect * section.count * targetRowHeight
                    const rows = Math.ceil(unwrappedWidth / viewportWidth)
                    layout = { sectionTop, containerHeight: rows * targetRowHeight }
                }
            } else {
                // Calculate boxes
                layout = createLayoutForLoadedSection(section, sectionTop, viewportWidth)
            }
        }

        const sectionBottom = sectionTop + sectionHeadHeight + layout.containerHeight
        if (layout.boxes) {
            if (sectionBottom < keepMinY || sectionTop > keepMaxY) {
                // This section is fully invisible -> Keep the layout but add no photos to the DOM
                layout.fromBoxIndex = null
                layout.toBoxIndex = null
            } else {
                // This section is visible (fully or partly)
                layout.fromBoxIndex = 0
                layout.toBoxIndex = section.count

                if (sectionTop < keepMinY || sectionBottom > keepMaxY) {
                    // This section is party visible -> Go throw the boxes and find the correct boundaries
                    const boxes = layout.boxes
                    const boxCount = boxes.length

                    let searchingStart = true
                    for (let boxIndex = 0; boxIndex < boxCount; boxIndex++) {
                        const box = boxes[boxIndex]
                        const boxTop = sectionTop + sectionHeadHeight + box.top
                        const boxBottom = boxTop + box.height
                        if (searchingStart) {
                            if (boxBottom >= keepMinY) {
                                layout.fromBoxIndex = boxIndex
                                searchingStart = false
                            }
                        } else if (boxTop > keepMaxY) {
                            layout.toBoxIndex = boxIndex
                            break
                        }
                    }
                }
            }
        }

        sectionLayouts.push(layout)

        // -- Check whether we have to load or forget this section --

        if (section.photoIds) {
            const keepSection = sectionBottom > keepMinY && sectionTop < keepMaxY
            if (!keepSection) {
                if (!sectionIdsToProtect) {
                    sectionIdsToProtect = getSectionIdsToProtect()
                }

                if (!sectionIdsToProtect[sectionId]) {
                    if (!sectionIdsToForget) {
                        sectionIdsToForget = {}
                    }
                    sectionIdsToForget[sectionId] = true
                }
            }
        } else if (!isFetchingSectionPhotos) {
            const loadSection = sectionBottom > preloadMinY && sectionTop < preloadMaxY
            if (loadSection) {
                let distanceToViewPort = 0
                if (sectionBottom < scrollTop) {
                    distanceToViewPort = scrollTop - sectionBottom
                } else if (sectionTop > scrollTop + viewportHeight) {
                    distanceToViewPort = sectionTop - (scrollTop + viewportHeight)
                }

                if (distanceToViewPort < sectionIdToLoadDistance) {
                    sectionIdToLoad = sectionId
                    sectionIdToLoadDistance = distanceToViewPort
                }
            }
        }

        // -- Prepare next iteration --

        sectionTop = sectionBottom
    }

    if (sectionIdsToForget) {
        setTimeout(() => store.dispatch(forgetSectionPhotosAction(sectionIdsToForget)))
    }
    if (sectionIdToLoad) {
        fetchSectionPhotos(sectionIdToLoad)
    }

    if (profiler) {
        profiler.addPoint('Calculated layout')
        profiler.logResult()
    }

    prevSectionIds = sectionIds
    prevSectionById = sectionById
    prevSectionLayouts = sectionLayouts
    prevScrollTop = scrollTop
    prevViewportWidth = viewportWidth
    prevViewportHeight = viewportHeight

    return sectionLayouts
}


export function createLayoutForLoadedSection(section: PhotoSection, sectionTop: number, containerWidth: number): GridSectionLayout {
    const aspects = section.photoIds.map(photoId => {
        const photo = section.photoData[photoId]
        const { master_width, master_height } = photo
        // If we have no master size yet (which happens when loading an old DB were it was missing), the following will happen:
        //   - We calculate a layout using the average aspect (which is how the loading rect of the photo is shown)
        //   - `ThumbnailRenderer.renderThumbnailForPhoto` will detect that the master size is missing and will update the DB
        //   - The Grid will trigger a layout, because the photo has changed in the app state
        //   - `getLayoutForSections` will detect that the section changed and so it will get a ney layout using the correct master size
        return (master_width && master_height) ? (master_width / master_height) : averageAspect
    })
    const layout = createLayout(aspects, { containerWidth })
    layout.sectionTop = sectionTop
    layout.containerHeight = Math.round(layout.containerHeight)
    return layout
}


function getSectionIdsToProtect(): { [index: string]: true } {
    const state = store.getState()
    let sectionsToProtect = {}

    const selectedSectionId = state.library.selection.sectionId
    if (selectedSectionId) {
        sectionsToProtect[selectedSectionId] = true
    }

    if (state.detail) {
        sectionsToProtect[state.detail.currentPhoto.sectionId] = true
    }

    if (state.export) {
        sectionsToProtect[state.export.sectionId] = true
    }

    return sectionsToProtect
}


function fetchSectionPhotos(sectionId: PhotoSectionId) {
    if (isFetchingSectionPhotos) {
        return
    }

    const filter = store.getState().library.filter

    isFetchingSectionPhotos = true
    fetchSectionPhotosFromDb(sectionId, filter)
        .then(photos => {
            isFetchingSectionPhotos = false
            store.dispatch(fetchSectionPhotosAction(sectionId, photos))
        })
        .catch(error => {
            isFetchingSectionPhotos = false
            // TODO: Show error in UI
            console.error(`Fetching photos for section ${sectionId} failed`, error)
        })
}



type CreateThumbnailJob = { isCancelled: boolean, sectionId: PhotoSectionId, photo: PhotoType, profiler: Profiler }

const createThumbnailQueue = new SerialJobQueue(
    (newJob, existingJob) => (newJob.photo.id === existingJob.photo.id) ? newJob : null,
    createNextThumbnail,
    getThumbnailPriority)

export function createThumbnail(sectionId: PhotoSectionId, photo: PhotoType): CancelablePromise<string> {
    const profiler = profileThumbnailRenderer ? new Profiler(`Creating thumbnail for ${photo.master}`) : null

    const job: CreateThumbnailJob = { isCancelled: false, sectionId, photo, profiler }

    return new CancelablePromise<string>(
        createThumbnailQueue.addJob(job)
            .then(() => {
                if (profiler) profiler.logResult()
                return getThumbnailSrc(photo)
            })
    )
    .catch(error => {
        if (isCancelError(error)) {
            job.isCancelled = true
        }
        throw error
    })
}

async function createNextThumbnail(job: CreateThumbnailJob): Promise<void> {
    if (job.isCancelled) {
        return
    }

    await createThumbnailOnDisk(job.photo, job.profiler)
}

function getThumbnailPriority(job: CreateThumbnailJob): number {
    const { sectionId, photo } = job
    const sectionIndex = prevSectionIds.indexOf(sectionId)
    const section = prevSectionById[sectionId]
    const layout = prevSectionLayouts[sectionIndex]
    if (!section || !layout || !layout.boxes) {
        return Number.MIN_VALUE
    }

    const photoIndex = section.photoIds.indexOf(photo.id)
    const box = layout.boxes[photoIndex]
    if (!box) {
        return Number.MIN_VALUE
    }

    const boxTop = layout.sectionTop + sectionHeadHeight + box.top
    if (boxTop > prevScrollTop + prevViewportHeight) {
        // Box is below viewport
        return prevScrollTop + prevViewportHeight - boxTop  // should be negative
    }

    const boxBottom = boxTop + box.height
    if (boxBottom < prevScrollTop) {
        // Box is above viewport
        return boxBottom - prevScrollTop  // should be negative
    }

    // Box is visible
    return 0
}
