import { fetchPhotoWork, storePhotoWork, storeThumbnail } from './PhotoWorkStore'
import { PhotoWork } from './models/Photo'


export function fetchPhotoWorkWithCallback(photoPath: string, callback: (error: any, result: PhotoWork) => void) {
    promiseToCallback(fetchPhotoWork(photoPath), callback)
}


export function storePhotoWorkWithCallback(photoPath: string, photoWork: PhotoWork, callback: (error: any) => void) {
    promiseToCallback(storePhotoWork(photoPath, photoWork), callback)
}


export function storeThumbnailWithCallback(thumbnailPath: string, thumbnailData: string, callback: (error: any) => void) {
    promiseToCallback(storeThumbnail(thumbnailPath, thumbnailData), callback)
}


function promiseToCallback<ValueType>(promise: Promise<ValueType>, callback: (error: any, result?: ValueType) => void) {
    promise.then(result => callback(null, result), error => callback(error))
}
