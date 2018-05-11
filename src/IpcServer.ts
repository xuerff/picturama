import { storePhotoWork } from './PhotoWorkStore'
import { PhotoWork } from './models/Photo'


export function storePhotoWorkWithCallback(photoPath: string, photoWork: PhotoWork, callback: (error: any) => void) {
    promiseToCallback(storePhotoWork(photoPath, photoWork), callback)
}


function promiseToCallback<ValueType>(promise: Promise<ValueType>, callback: (error: any, result?: ValueType) => void) {
    promise.then(result => callback(null, result), error => callback(error))
}
