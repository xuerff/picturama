import { PhotoId, PhotoSectionId } from 'common/models/Photo'
import CancelablePromise, { isCancelError } from 'common/util/CancelablePromise'
import { assertRendererProcess } from 'common/util/ElectronUtil'

import BackgroundClient from 'ui/BackgroundClient'
import { setDetailPhotoAction, closeDetailAction } from 'ui/state/actions'
import { getPhotoByIndex, getSectionById } from 'ui/state/selectors'
import store from 'ui/state/store'


assertRendererProcess()

export function setDetailPhotoById(sectionId: PhotoSectionId, photoId: PhotoId | null) {
    const section = getSectionById(sectionId)
    const photoIndex = (section && section.photoIds && photoId != null) ? section.photoIds.indexOf(photoId) : -1
    setDetailPhotoByIndex(sectionId, (photoIndex === -1) ? null : photoIndex)
}

let runningDetailPhotoFetch: CancelablePromise<any> | null = null
export function setDetailPhotoByIndex(sectionId: PhotoSectionId | null, photoIndex: number | null) {
    if (sectionId == null || photoIndex == null) {
        store.dispatch(closeDetailAction())
        return
    }

    const photo = getPhotoByIndex(sectionId, photoIndex)
    if (!photo) {
        store.dispatch(setDetailPhotoAction.failure(new Error(`No photo at index ${photoIndex}`)))
        return
    }

    store.dispatch(setDetailPhotoAction.request({ sectionId, photoIndex, photoId: photo.id }))

    if (runningDetailPhotoFetch) {
        runningDetailPhotoFetch.cancel()
    }

    const photoPath = photo.master
    runningDetailPhotoFetch = new CancelablePromise(Promise.all(
        [
            BackgroundClient.fetchPhotoDetail(photo.id),
            BackgroundClient.fetchPhotoWork(photoPath)
        ]))
        .then(results => {
            const [ photoDetail, photoWork ] = results
            store.dispatch(setDetailPhotoAction.success({ photoDetail, photoWork }))
        })
        .catch(error => {
            if (!isCancelError(error)) {
                // TODO: Show error to the user
                console.error('Fetching photo work failed: ' + photoPath, error)
                store.dispatch(setDetailPhotoAction.failure(error))
            }
        })
        .then(() => runningDetailPhotoFetch = null)
}

export function setPreviousDetailPhoto() {
    const state = store.getState()
    if (state.detail) {
        const currentPhoto = state.detail.currentPhoto
        const currentIndex = currentPhoto.photoIndex
        if (currentIndex > 0) {
            setDetailPhotoByIndex(currentPhoto.sectionId, currentIndex - 1)
        }
    }
}

export function setNextDetailPhoto() {
    const state = store.getState()
    if (state.detail) {
        const currentPhoto = state.detail.currentPhoto
        const currentIndex = currentPhoto.photoIndex
        const section = getSectionById(currentPhoto.sectionId)
        if (section && section.photoIds && currentIndex < section.photoIds.length - 1) {
            setDetailPhotoByIndex(currentPhoto.sectionId, currentIndex + 1)
        }
    }
}
