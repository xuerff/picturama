import { PhotoType } from '../../common/models/Photo'
import store from './store'


export function getPhotoByIndex(photoIndex: number): PhotoType | null {
    const photos = store.getState().library.photos
    return photos.data[photos.ids[photoIndex]]
}

export function getPhotoById(photoId: string): PhotoType | null {
    const photos = store.getState().library.photos
    return photos.data[photoId]
}
