import { Promise } from 'bluebird'

import Photo, { PhotoType, PhotoWork } from '../models/Photo'
import { fetchPhotoWork, storePhotoWork, storeThumbnail } from '../BackgroundClient'
import { renderThumbnailForPhoto } from '../renderer/ThumbnailRenderer'


// We queue pending PhotoWork updates, so we don't get lost updates if multiple updates wait for fetching to finish
const pendingUpdates: { photo: PhotoType, updates: ((photoWork: PhotoWork) => void)[] }[] = []

export const updatePhotoWork = (photo: PhotoType, update: (photoWork: PhotoWork) => void) => dispatch => {
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
                for (const up of pendingUpdate.updates) {
                    up(photoWork)
                }
                delete pendingUpdates[photoPath]

                // We do all in parallel:
                //   - Show the new effects in UI
                //   - Store PhotoWork to ansel.json
                //   - Update Thumbnail

                dispatch({
                    type: 'EDIT_PHOTOWORK_CHANGE',
                    photoId: photo.id,
                    photoWork
                })

                return Promise.all([
                    storePhotoWork(photoPath, photoWork),
                    renderThumbnailForPhoto(photo, photoWork)
                        .then(thumbnailData => storeThumbnail(photo.thumb_250, thumbnailData))
                        .then(() => window.dispatchEvent(new CustomEvent('edit:thumnailChange', { detail: { photoId: photo.id } })))
                ])
            })
            .catch(error => {
                delete pendingUpdates[photoPath]
                console.log('Updating photo work failed: ' + photo.master, error)  // TODO: Show error message in UI
            })
    }
}


export const toggleFlag = (photo: PhotoType) => dispatch => {
    const newFlagged = !photo.flag

    storeFlagged(photo, newFlagged, dispatch)

    new Photo({ id: photo.id })
        .save('flag', newFlagged, { patch: true })
        .then(() => new Photo({ id: photo.id })
            .fetch({ withRelated: [ 'versions', 'tags' ] })
        )
        .then(photoModel =>
            dispatch({ type: 'UPDATED_PHOTO_SUCCESS', photo: photoModel.toJSON() })
        )
}


export const flagSet = (photos: PhotoType[], flaggedPhotos: PhotoType[], flag: boolean) => dispatch => {
    Promise.each(flaggedPhotos, photo => {
        storeFlagged(photo, flag, dispatch)
        return new Photo({ id: photo.id })
            .save('flag', flag, { patch: true })
    })
    .then(() => photos)
    .map((photo: PhotoType) => new Photo({ id: photo.id })
        .where({ trashed: 0 })
        .fetch({ withRelated: [ 'versions', 'tags' ] })
        .then(photo => photo.toJSON())
    )
    .then(photos => {
        dispatch({
            type: 'GET_PHOTOS_SUCCESS',
            photos: photos
        })
    })
}


function storeFlagged(photo: PhotoType, newFlagged: boolean, dispatch) {
    updatePhotoWork(
        photo,
        photoWork => {
            if (newFlagged) {
                photoWork.flagged = true
            } else {
                delete photoWork.flagged
            }
        })(dispatch)
}
