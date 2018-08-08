import * as fs from 'fs'

import config from '../../common/config'
import { PhotoId, PhotoType } from '../../common/models/Photo'
import CancelablePromise from '../../common/util/CancelablePromise'
import SerialJobQueue from '../../common/util/SerialJobQueue'
import { profileThumbnailRenderer } from '../../common/LogConstants'
import Profiler from '../../common/util/Profiler'
import { renderThumbnailForPhoto } from '../renderer/ThumbnailRenderer'
import { fetchPhotoWork, storeThumbnail } from '../BackgroundClient'


async function unlink(path: string): Promise<void> {
    return new Promise<void>((resolve, reject) => fs.unlink(path, error => { if (error) { reject(error) } else { resolve() } }))
}

async function exists(path: string | Buffer): Promise<boolean> {
    return new Promise<boolean>(resolve => fs.exists(path, resolve))
}


let thumbnailVersion = Date.now()

type CreateThumbnailJob = { photo: PhotoType, thumbnailPath: string }

const createThumbnailQueue = new SerialJobQueue(
    (newJob, existingJob) => (newJob.photo.id === existingJob.photo.id) ? newJob : null,
    createNextThumbnail)


export function getNonRawImgPath(photo: PhotoType): string {
    return photo.thumb || photo.master
}

export async function onThumnailChange(photoId: PhotoId): Promise<void> {
    const thumbnailPath = getRawThumbnailPath(photoId)

    const thumbnailExists = await exists(thumbnailPath)
    if (thumbnailExists) {
        await unlink(thumbnailPath)
    }

    thumbnailVersion = Date.now()
    window.dispatchEvent(new CustomEvent('edit:thumnailChange', { detail: { photoId } }))
}


function getRawThumbnailPath(photoId: PhotoId) {
    return `${config.thumbs250Path}/${photoId}.${config.workExt}`
}


export function getThumbnailPath(photo: PhotoType): CancelablePromise<string> {
    const thumbnailPath = getRawThumbnailPath(photo.id)
    return new CancelablePromise<boolean>(exists(thumbnailPath))
        .then(alreadExists => {
            if (!alreadExists) {
                return createThumbnailQueue.addJob({ photo, thumbnailPath })
            }
        })
        .then(() => `${thumbnailPath}?v=${thumbnailVersion}`)
}


async function createNextThumbnail(job: CreateThumbnailJob): Promise<void> {
    const photo = job.photo
    const profiler = profileThumbnailRenderer ? new Profiler(`Creating thumbnail for ${photo.master}`) : null

    const photoWork = await fetchPhotoWork(photo.master)
    if (profiler) profiler.addPoint('Fetched PhotoWork')

    const thumbnailData = await renderThumbnailForPhoto(photo, photoWork, profiler)

    await storeThumbnail(job.thumbnailPath, thumbnailData)
    if (profiler) {
        profiler.addPoint('Stored thumbnail')
        profiler.logResult()
    }
}
