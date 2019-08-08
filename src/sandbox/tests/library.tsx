import React from 'react'

import { PhotoType, PhotoSectionById, PhotoSectionId } from 'common/models/Photo'
import CancelablePromise from 'common/util/CancelablePromise'

import { defaultGridRowHeight } from 'ui/UiConstants'
import { GridLayout } from 'ui/UITypes'
import { getNonRawImgPath } from 'ui/controller/ImageProvider'
import { sectionHeadHeight } from 'ui/components/library/GridSection'
import { Library, Props } from 'ui/components/library/Library'

import { addSection, action, TestContext } from 'sandbox/core/UiTester'
import { testLandscapePhoto, testPortraitPhoto, testPanoramaPhoto, testPhotos } from 'sandbox/util/MockData'
import { createRandomDummyPhoto, createSection, createLayoutForSection } from 'sandbox/util/TestUtil'


const defaultSectionId: PhotoSectionId = '2018-08-15'
const defaultPhotos = [ testLandscapePhoto, testPortraitPhoto, testPanoramaPhoto ]
const defaultSection = createSection(defaultSectionId, defaultPhotos)

const defaultProps: Props = {
    style: { width: '100%', height: '100%', overflow: 'hidden' },
    isActive: true,

    isFetching: false,

    photoCount: 1042,
    totalPhotoCount: 12345,
    sectionIds: [ defaultSectionId ],
    sectionById: {
        [defaultSectionId]: defaultSection
    } as PhotoSectionById,
    selectedSectionId: null,
    selectedPhotoIds: [],
    infoPhoto: null,
    infoPhotoDetail: null,
    tags: [],
    gridRowHeight: defaultGridRowHeight,
    showOnlyFlagged: false,
    isShowingTrash: false,

    fetchTotalPhotoCount: action('fetchTotalPhotoCount'),
    fetchSections: action('fetchSections'),
    getGridLayout,
    getThumbnailSrc: (photo: PhotoType) => getNonRawImgPath(photo),
    createThumbnail: (sectionId: PhotoSectionId, photo: PhotoType) => {
        const thumbnailPath = getNonRawImgPath(photo)
        if (thumbnailPath === 'dummy') {
            return new CancelablePromise<string>(() => {})
        } else {
            return new CancelablePromise<string>(Promise.resolve(thumbnailPath))
        }
    },
    setGridRowHeight: action('setGridRowHeight'),
    setSelectedPhotos: action('setSelectedPhotos'),
    setDetailPhotoById: action('setDetailPhotoById'),
    setInfoPhoto: action('setInfoPhoto'),
    openExport: action('openExport'),
    setPhotosFlagged: action('setPhotosFlagged'),
    setPhotoTags: action('setPhotoTags'),
    updatePhotoWork: action('updatePhotoWork'),
    movePhotosToTrash: action('movePhotosToTrash'),
    restorePhotosFromTrash: action('restorePhotosFromTrash'),
    toggleShowOnlyFlagged: action('toggleShowOnlyFlagged'),
    startScanning: action('startScanning'),
}


export function getGridLayout(sectionIds: PhotoSectionId[], sectionById: PhotoSectionById,
    scrollTop: number, viewportWidth: number, viewportHeight: number, gridRowHeight: number):
    GridLayout
{
    let sectionTop = 0
    const sectionLayouts = sectionIds.map(sectionId => {
        const section = sectionById[sectionId]
        const layout = createLayoutForSection(section, sectionTop, viewportWidth, gridRowHeight)
        sectionTop += sectionHeadHeight + layout.containerHeight
        return layout
    })

    return {
        fromSectionIndex: 0,
        toSectionIndex: sectionIds.length,
        sectionLayouts
    }
}

let sharedGridRowHeight = defaultGridRowHeight
    // Use the same gridRowHeight amoung all tests (so row height doesn't change when changing between tests)

function createGridRowHeightProps(context: TestContext) {
    return {
        gridRowHeight: sharedGridRowHeight,
        setGridRowHeight: (gridRowHeight: number) => {
            sharedGridRowHeight = gridRowHeight
            context.forceUpdate()
        }
    }
}


addSection('Library')
    .add('normal', context => (
        <Library
            {...defaultProps}
            {...createGridRowHeightProps(context)}
        />
    ))
    .add('selection', context => (
        <Library
            {...defaultProps}
            {...createGridRowHeightProps(context)}
            selectedSectionId={defaultSectionId}
            selectedPhotoIds={[ testLandscapePhoto.id ]}
            infoPhoto={testLandscapePhoto}
            infoPhotoDetail={{ versions:[], tags: [] }}
        />
    ))
    .add('scrolling', context => {
        const sectionIds: PhotoSectionId[] = []
        for (let i = 50; i > 0; i--) {
            const month = (i % 12) + 1
            const year = 2000 + Math.floor(i / 12)
            sectionIds.push(`${year}-${month < 10 ? '0' : ''}${month}-01`)
        }

        const sectionById: PhotoSectionById = {}
        for (const sectionId of sectionIds) {
            sectionById[sectionId] = createSection(sectionId, randomizedArray(testPhotos))
        }

        return (
            <Library
                {...defaultProps}
                {...createGridRowHeightProps(context)}
                sectionIds={sectionIds}
                sectionById={sectionById}
            />
        )
    })
    .add('creating thumbnails', context => {
        let photos = [ ...defaultPhotos ]
        for (let i = 0; i < 100; i++) {
            photos.push(createRandomDummyPhoto())
        }
        const section = createSection(defaultSectionId, photos)

        return (
            <Library
                {...defaultProps}
                {...createGridRowHeightProps(context)}
                sectionIds={[ defaultSectionId ]}
                sectionById={{
                    [defaultSectionId]: section
                } as PhotoSectionById}
            />
        )
    })
    .add('thumbnail error', context => {
        let photos = [ ...defaultPhotos ]
        const errorPhoto = createRandomDummyPhoto()
        errorPhoto.master = 'error'
        photos.splice(1, 0, errorPhoto)
        const section = createSection(defaultSectionId, photos)

        return (
            <Library
                {...defaultProps}
                {...createGridRowHeightProps(context)}
                sectionIds={[ defaultSectionId ]}
                sectionById={{
                    [defaultSectionId]: section
                } as PhotoSectionById}
            />
        )
    })
    .add('Fetching sections', context => (
        <Library
            {...defaultProps}
            {...createGridRowHeightProps(context)}
            isFetching={true}
        />
    ))
    .add('Selection empty', context => (
        <Library
            {...defaultProps}
            {...createGridRowHeightProps(context)}
            photoCount={0}
            sectionIds={[]}
            sectionById={{}}
        />
    ))
    .add('No photos', context => (
        <Library
            {...defaultProps}
            {...createGridRowHeightProps(context)}
            photoCount={0}
            totalPhotoCount={0}
            sectionIds={[]}
            sectionById={{}}
        />
    ))
    .add('Trash with selection', context => (
        <Library
            {...defaultProps}
            {...createGridRowHeightProps(context)}
            isShowingTrash={true}
            selectedSectionId={defaultSectionId}
            selectedPhotoIds={[ testLandscapePhoto.id ]}
            infoPhoto={testLandscapePhoto}
            infoPhotoDetail={{ versions:[], tags: [] }}
        />
    ))
    .add('Trash - no photos', context => (
        <Library
            {...defaultProps}
            {...createGridRowHeightProps(context)}
            isShowingTrash={true}
            photoCount={0}
            sectionIds={[]}
            sectionById={{}}
        />
    ))


function randomizedArray<T>(array: T[]): T[] {
    const remaining = [ ...array ]
    const result: T[] = []
    while (remaining.length > 0) {
        const randomIndex = Math.floor(Math.random() * remaining.length)
        result.push(remaining.splice(randomIndex, 1)[0])
    }
    return result
}
