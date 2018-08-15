import fs from 'fs'

import { PhotoId, PhotoType, getThumbnailPath } from '../../common/models/Photo'
import CancelablePromise, { isCancelError } from '../../common/util/CancelablePromise'
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

type CreateThumbnailJob = { isCancelled: boolean, photo: PhotoType, profiler: Profiler }

const createThumbnailQueue = new SerialJobQueue(() => null, createNextThumbnail)


export function getNonRawImgPath(photo: PhotoType): string {
    return photo.non_raw || photo.master
}

export async function onThumnailChange(photoId: PhotoId): Promise<void> {
    const thumbnailPath = getThumbnailPath(photoId)

    const thumbnailExists = await exists(thumbnailPath)
    if (thumbnailExists) {
        await unlink(thumbnailPath)
    }

    thumbnailVersion = Date.now()
    window.dispatchEvent(new CustomEvent('edit:thumnailChange', { detail: { photoId } }))
}


export function getThumbnailSrc(photo: PhotoType): string {
    const thumbnailPath = getThumbnailPath(photo.id)
    return `${thumbnailPath}?v=${thumbnailVersion}`
}


export function createThumbnail(photo: PhotoType): CancelablePromise<string> {
    const profiler = profileThumbnailRenderer ? new Profiler(`Creating thumbnail for ${photo.master}`) : null
    const job: CreateThumbnailJob = { isCancelled: false, photo, profiler }

    return new CancelablePromise<string>(
        createThumbnailQueue.addJob(job)
            .then(() => {
                if (profiler) profiler.logResult()
                return getThumbnailSrc(photo)
            })
    )
    .catch(error => {
        if (isCancelError(error)) {
            job.isCancelled = true
        }
        throw error
    })
}


async function createNextThumbnail(job: CreateThumbnailJob): Promise<void> {
    if (job.isCancelled) {
        return Promise.resolve()
    }

    const profiler = job.profiler
    if (profiler) profiler.addPoint('Waited in queue')

    const photo = job.photo
    const thumbnailPath = getThumbnailPath(photo.id)
    const thumbnailExists = await exists(thumbnailPath)
    if (profiler) profiler.addPoint('Checked if thumbnail exists')
    if (thumbnailExists) {
        return
    }    

    const photoWork = await fetchPhotoWork(photo.master)

    if (profiler) profiler.addPoint('Fetched PhotoWork')

    const thumbnailData = await renderThumbnailForPhoto(photo, photoWork, profiler)

    await storeThumbnail(thumbnailPath, thumbnailData)
    if (profiler) profiler.addPoint('Stored thumbnail')
}
