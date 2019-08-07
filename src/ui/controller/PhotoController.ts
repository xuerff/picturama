import Promise from 'bluebird'
import isDeepEqual from 'fast-deep-equal'

import Photo, { PhotoWork, PhotoType, PhotoFilter } from '../../common/models/Photo'
import { VersionType } from '../../common/models/Version'
import { assertRendererProcess } from '../../common/util/ElectronUtil'
import { cloneDeep } from '../../common/util/LangUtil'

import { fetchSections as fetchSectionsFromDb, updatePhotos as updatePhotosInDb, fetchPhotoWork, storePhotoWork } from '../BackgroundClient'
import store from '../state/store'
import { fetchTotalPhotoCountAction, fetchSectionsAction, changePhotoWorkAction, changePhotosAction } from '../state/actions'
import { onThumbnailChange } from './ImageProvider'


assertRendererProcess()

export function fetchTotalPhotoCount() {
    Photo.forge()
        .count()
        .then(totalPhotoCount => store.dispatch(fetchTotalPhotoCountAction(totalPhotoCount)))
}

export function fetchSections() {
    internalFetchSections(null)
}

export function setLibraryFilter(newFilter: PhotoFilter) {
    internalFetchSections(newFilter)
}

function internalFetchSections(newFilter: PhotoFilter | null) {
    const filter = newFilter || store.getState().library.filter

    store.dispatch(fetchSectionsAction.request({ newFilter }))
    fetchSectionsFromDb(filter)
        .then(sections => {
            store.dispatch(fetchSectionsAction.success({ sections }))
        })
        .catch(error => {
            console.error('Fetching sections failed', error)
            store.dispatch(fetchSectionsAction.failure(error))
        })
}


// We queue pending PhotoWork updates, so we don't get lost updates if multiple updates wait for fetching to finish
const pendingUpdates: { photo: PhotoType, updates: ((photoWork: PhotoWork) => void)[] }[] = []

export function updatePhotoWork(photo: PhotoType, update: (photoWork: PhotoWork) => void) {
    const photoPath = photo.master
    let pendingUpdate = pendingUpdates[photoPath]
    if (pendingUpdate) {
        pendingUpdate.updates.push(update)
    } else {
        pendingUpdate = {
            photo,
            updates: [ update ]
        }
        pendingUpdates[photoPath] = pendingUpdate

        fetchPhotoWork(photoPath)
            .then(photoWork => {
                const photoWorkBefore = { ...photoWork }
                for (const up of pendingUpdate.updates) {
                    up(photoWork)
                }
                delete pendingUpdates[photoPath]

                // Ignore changes on meta data (like flagged or tags)
                const thumbnailNeedsUpdate = photoWork.rotationTurns !== photoWorkBefore.rotationTurns

                // We do all in parallel:
                //   - Show the new effects in UI
                //   - Store PhotoWork to ansel.json
                //   - Update Thumbnail

                store.dispatch(changePhotoWorkAction(photo.id, photoWork))

                return Promise.all([
                    storePhotoWork(photoPath, photoWork),
                    thumbnailNeedsUpdate ? onThumbnailChange(photo.id) : Promise.resolve()
                ])
            })
            .catch(error => {
                delete pendingUpdates[photoPath]
                // TODO: Show error message in UI
                console.error('Updating photo work failed: ' + photo.master, error)
            })
    }
}

export function updatePhotoVersion(version: VersionType) {  // Type should be `Version`, but it doesn't work...
    // TODO: Fix
    throw new Error('Not implemented')
    //new Photo({ id: version.photo_id })
    //    .fetch({ withRelated: [ 'versions', 'tags' ] })
    //    .then(photoModel => {
    //        const photo = photoModel.toJSON()
    //        return onThumnailChange(photo.id)
    //            .then(() => {
    //                const updatedPhoto = addVersionToPhoto(photo)
    //                store.dispatch(changePhotosAction([ updatedPhoto ]))
    //            })
    //    })
}

export function setPhotosFlagged(photos: PhotoType[], flagged: boolean) {
    updatePhotos(photos, { flag: flagged ? 1 : 0 })
}

export function movePhotosToTrash(photos: PhotoType[]) {
    updatePhotos(photos, { trashed: 1 })
}

export function restorePhotosFromTrash(photos: PhotoType[]) {
    updatePhotos(photos, { trashed: 0 })
}

export function updatePhoto(photo: PhotoType, update: Partial<PhotoType>) {
    updatePhotos([ photo ], update)
}

export function updatePhotos(photos: PhotoType[], update: Partial<PhotoType>) {
    let updatePhotoWorkPromise: Promise<any> | null = null
    if (update.hasOwnProperty('flag')) {
        updatePhotoWorkPromise = Promise.all(photos.map(photo =>
            updatePhotoWork(
                photo,
                photoWork => {
                    if (update.flag) {
                        photoWork.flagged = true
                    } else {
                        delete photoWork.flagged
                    }
                })
        ))
    }

    const photoIds = photos.map(photo => photo.id)
    Promise.all([
        updatePhotoWorkPromise,
        updatePhotosInDb(photoIds, update)
    ])
    .then(() => {
        const changedPhotos = photos.map(photo => ({ ...photo, ...update } as PhotoType))
        store.dispatch(changePhotosAction(changedPhotos, update))
    })
    .catch(error => {
        // TODO: Show error in UI
        console.error('Updating photos failed', error)
    })
}
