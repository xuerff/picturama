import fs from 'fs'

import { PhotoId, Photo } from 'common/CommonTypes'
import { getThumbnailPath, getThumbnailUrl } from 'common/util/DataUtil'
import Profiler from 'common/util/Profiler'

import { renderThumbnailForPhoto } from 'app/renderer/ThumbnailRenderer'
import BackgroundClient from 'app/BackgroundClient'


async function unlink(path: string): Promise<void> {
    return new Promise<void>((resolve, reject) => fs.unlink(path, error => { if (error) { reject(error) } else { resolve() } }))
}

async function exists(path: string | Buffer): Promise<boolean> {
    return new Promise<boolean>(resolve => fs.exists(path, resolve))
}


let thumbnailVersion = Date.now()


export async function onThumbnailChange(photoId: PhotoId): Promise<void> {
    const thumbnailPath = getThumbnailPath(photoId)

    const thumbnailExists = await exists(thumbnailPath)
    if (thumbnailExists) {
        await unlink(thumbnailPath)
    }

    thumbnailVersion = Date.now()
    window.dispatchEvent(new CustomEvent('edit:thumnailChange', { detail: { photoId } }))
}


export function getThumbnailSrc(photo: Photo): string {
    const thumbnailUrl = getThumbnailUrl(photo.id)
    return `${thumbnailUrl}?v=${thumbnailVersion}`
}


export async function createThumbnail(photo: Photo, profiler: Profiler | null = null): Promise<void> {
    const thumbnailPath = getThumbnailPath(photo.id)
    const thumbnailExists = await exists(thumbnailPath)
    if (profiler) profiler.addPoint('Checked if thumbnail exists')
    if (thumbnailExists) {
        return
    }

    const photoWork = await BackgroundClient.fetchPhotoWork(photo.master_dir, photo.master_filename)
    if (profiler) profiler.addPoint('Fetched PhotoWork')

    const thumbnailData = await renderThumbnailForPhoto(photo, photoWork, profiler)

    await BackgroundClient.storeThumbnail(thumbnailPath, thumbnailData)
    if (profiler) profiler.addPoint('Stored thumbnail')
}
