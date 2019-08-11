import Promise from 'bluebird'

import { PhotoWork, Photo, PhotoFilter } from 'common/CommonTypes'
import { assertRendererProcess } from 'common/util/ElectronUtil'

import BackgroundClient from 'ui/BackgroundClient'
import store from 'ui/state/store'
import { fetchTotalPhotoCountAction, fetchSectionsAction, changePhotoWorkAction, changePhotosAction } from 'ui/state/actions'

import { onThumbnailChange } from './ImageProvider'


assertRendererProcess()

export function fetchTotalPhotoCount() {
    BackgroundClient.fetchTotalPhotoCount()
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
    BackgroundClient.fetchSections(filter)
        .then(sections => {
            store.dispatch(fetchSectionsAction.success({ sections }))
        })
        .catch(error => {
            console.error('Fetching sections failed', error)
            store.dispatch(fetchSectionsAction.failure(error))
        })
}


// We queue pending PhotoWork updates, so we don't get lost updates if multiple updates wait for fetching to finish
const pendingUpdates: { photo: Photo, updates: ((photoWork: PhotoWork) => void)[] }[] = []

export function updatePhotoWork(photo: Photo, update: (photoWork: PhotoWork) => void) {
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

        BackgroundClient.fetchPhotoWork(photoPath)
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
                    BackgroundClient.storePhotoWork(photoPath, photoWork),
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

// TODO: Revive Legacy code of 'version' feature
/*
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
*/

export function setPhotosFlagged(photos: Photo[], flagged: boolean) {
    updatePhotos(photos, { flag: flagged ? 1 : 0 })
}

export function movePhotosToTrash(photos: Photo[]) {
    updatePhotos(photos, { trashed: 1 })
}

export function restorePhotosFromTrash(photos: Photo[]) {
    updatePhotos(photos, { trashed: 0 })
}

export function updatePhoto(photo: Photo, update: Partial<Photo>) {
    updatePhotos([ photo ], update)
}

export function updatePhotos(photos: Photo[], update: Partial<Photo>) {
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
        BackgroundClient.updatePhotos(photoIds, update)
    ])
    .then(() => {
        const changedPhotos = photos.map(photo => ({ ...photo, ...update } as Photo))
        store.dispatch(changePhotosAction(changedPhotos, update))
    })
    .catch(error => {
        // TODO: Show error in UI
        console.error('Updating photos failed', error)
    })
}
