import config from 'common/config'
import { PhotoId, Photo, ExifOrientation, PhotoWork } from 'common/CommonTypes'


export function getThumbnailPath(photoId: PhotoId): string {
    return `${config.thumbnailPath}/${shortId(photoId)}.${config.workExt}`
}


export function getNonRawPath(photo: Photo): string {
    return photo.master_is_raw ? `${config.nonRawPath}/${shortId(photo.id)}.${config.workExt}` : photo.master
}


function shortId(id: number): string {
    return id.toString(36)
}


export function getTotalRotationTurns(exifOrientation: ExifOrientation, photoWork: PhotoWork) {
    let exifRotationTurns = 0
    switch (exifOrientation) {
        case ExifOrientation.Right:  exifRotationTurns = 1; break
        case ExifOrientation.Bottom: exifRotationTurns = 2; break
        case ExifOrientation.Left:   exifRotationTurns = 3; break
    }
    return (exifRotationTurns + (photoWork.rotationTurns || 0)) % 4
}
