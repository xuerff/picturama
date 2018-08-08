import { fetchPhotoWork } from '../BackgroundClient'
import { PhotoId, PhotoWork } from '../models/Photo'
import store from '../state/store'
import { setDetailPhotoAction, closeDetailAction } from '../state/actions'
import { getPhotoByIndex, getPhotoById } from '../state/selectors'
import CancelablePromise, { isCancelError } from '../util/CancelablePromise'
import { assertRendererProcess } from '../util/ElectronUtil'
import { toggleFlag } from './PhotoStore'


assertRendererProcess()

export function setDetailPhotoById(photoId: PhotoId | null) {
    const state = store.getState()
    const photoIndex = state.library.photos.ids.indexOf(photoId)
    setDetailPhotoByIndex((photoIndex === -1) ? null : photoIndex)
}

let runningDetailPhotoFetch: CancelablePromise<void> | null = null
export function setDetailPhotoByIndex(photoIndex: number | null) {
    if (photoIndex == null) {
        store.dispatch(closeDetailAction())
        return
    }

    const photo = getPhotoByIndex(photoIndex)
    if (!photo) {
        store.dispatch(setDetailPhotoAction.failure(new Error(`No photo at index ${photoIndex}`)))
        return
    }

    store.dispatch(setDetailPhotoAction.request({ photoIndex, photoId: photo.id }))

    if (runningDetailPhotoFetch) {
        runningDetailPhotoFetch.cancel()
    }

    const photoPath = photo.master
    runningDetailPhotoFetch = new CancelablePromise<PhotoWork>(fetchPhotoWork(photoPath))
        .then(photoWork => {
            store.dispatch(setDetailPhotoAction.success({ photoWork }))
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
        const currentIndex = state.detail.currentPhoto.index
        if (currentIndex > 0) {
            setDetailPhotoByIndex(currentIndex - 1)
        }
    }
}

export function setNextDetailPhoto() {
    const state = store.getState()
    if (state.detail) {
        const currentIndex = state.detail.currentPhoto.index
        if (currentIndex < state.library.photos.ids.length - 1) {
            setDetailPhotoByIndex(currentIndex + 1)
        }
    }
}

export function toggleDetailPhotoFlag() {
    const state = store.getState()
    if (state.detail) {
        const detailPhoto = getPhotoById(state.detail.currentPhoto.id)
        toggleFlag(detailPhoto)
    }
}
