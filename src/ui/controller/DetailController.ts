import { PhotoId, PhotoSectionId } from '../../common/models/Photo'
import CancelablePromise, { isCancelError } from '../../common/util/CancelablePromise'
import { assertRendererProcess } from '../../common/util/ElectronUtil'

import { fetchPhotoDetail, fetchPhotoWork } from '../BackgroundClient'
import { setDetailPhotoAction, closeDetailAction } from '../state/actions'
import { getPhotoByIndex, getPhotoById, getSectionById } from '../state/selectors'
import store from '../state/store'
import { setPhotosFlagged } from './PhotoController'


assertRendererProcess()

export function setDetailPhotoById(sectionId: PhotoSectionId, photoId: PhotoId | null) {
    const section = getSectionById(sectionId)
    const photoIndex = (section && section.photoIds) ? section.photoIds.indexOf(photoId) : -1
    setDetailPhotoByIndex(sectionId, (photoIndex === -1) ? null : photoIndex)
}

let runningDetailPhotoFetch: CancelablePromise<void> | null = null
export function setDetailPhotoByIndex(sectionId: PhotoSectionId, photoIndex: number | null) {
    if (photoIndex == null) {
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
            fetchPhotoDetail(photo.id),
            fetchPhotoWork(photoPath)
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

export function toggleDetailPhotoFlag() {
    const state = store.getState()
    if (state.detail) {
        const currentPhoto = state.detail.currentPhoto
        const detailPhoto = getPhotoById(currentPhoto.sectionId, currentPhoto.photoId)
        setPhotosFlagged([ detailPhoto ], !detailPhoto.flag)
    }
}
