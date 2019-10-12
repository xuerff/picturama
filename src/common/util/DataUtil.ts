import config from 'common/config'
import { PhotoId, Photo, ExifOrientation, PhotoWork } from 'common/CommonTypes'

import { fileUrlFromPath } from './TextUtil'


export function getMasterPath(photo: Photo | { master_dir: string, master_filename: string }): string {
    return `${photo.master_dir}/${photo.master_filename}`
}

export function getThumbnailPath(photoId: PhotoId): string {
    return `${config.thumbnailPath}/${shortId(photoId)}.${config.workExt}`
}

export function getThumbnailUrl(photoId: PhotoId): string {
    return fileUrlFromPath(getThumbnailPath(photoId))
}

export function getRenderedRawPath(photoId: PhotoId): string {
    return `${config.nonRawPath}/${shortId(photoId)}.${config.workExt}`
}

export function getNonRawPath(photo: Photo): string {
    // TODO: Revive Legacy code of 'version' feature
    /*
    const photoDetail = await fetchPhotoDetail(photo.id)
    if (photoDetail.versions.length > 0) {
        const last = photoDetail.versions[photoDetail.versions.length - 1]
        return last.output
    }
    */

    return photo.master_is_raw ? getRenderedRawPath(photo.id) : getMasterPath(photo)
}

export function getNonRawUrl(photo: Photo): string {
    return fileUrlFromPath(getNonRawPath(photo))
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
