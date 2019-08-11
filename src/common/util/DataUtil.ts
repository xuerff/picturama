import config from 'common/config'
import { PhotoId, ExifOrientation, PhotoWork } from 'common/CommonTypes'


export function getThumbnailPath(photoId: PhotoId): string {
    return `${config.thumbnailPath}/${photoId}.${config.workExt}`
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
