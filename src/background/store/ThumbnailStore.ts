import { PhotoId, Size, Photo } from 'common/CommonTypes'
import { getThumbnailPath } from 'common/util/DataUtil'

import { fsExists, fsUnlink, fsWriteFile } from 'background/util/FileUtil'
import { fetchPhotoWork } from './PhotoWorkStore'
import ForegroundClient from 'background/ForegroundClient'
import SerialJobQueue from 'common/util/SerialJobQueue'


// Default row height of 'justified-layout' is 320px.
// Max width is relatively high in order to get most panorama images with full row height.
const maxThumbnailSize: Size = { width: 1024, height: 320 }


const createThumbnailQueue = new SerialJobQueue(
    (newJob, existingJob) => (newJob.photo.id === existingJob.photo.id) ? newJob : null,
    processNextCreateThumbnail)

export async function createThumbnail(photo: Photo): Promise<void> {
    return createThumbnailQueue.addJob({ photo })
}

async function processNextCreateThumbnail(job: { photo: Photo }): Promise<void> {
    const { photo } = job

    const thumbnailPath = getThumbnailPath(photo.id)
    const thumbnailExists = await fsExists(thumbnailPath)
    if (thumbnailExists) {
        return
    }

    const photoWork = await fetchPhotoWork(photo.master_dir, photo.master_filename)

    const thumbnailData = await ForegroundClient.renderPhoto(photo, photoWork, maxThumbnailSize)

    // thumbnailData is a data URL. Example: 'data:image/webp;base64,UklG...'
    const dataPrefix = 'base64,'
    const base64Data = thumbnailData.substr(thumbnailData.indexOf(dataPrefix) + dataPrefix.length)
    const dataBuffer = new Buffer(base64Data, 'base64')
    await fsWriteFile(thumbnailPath, dataBuffer)
    console.log('Stored ' + thumbnailPath)
}


export async function deleteThumbnail(photoId: PhotoId): Promise<void> {
    const thumbnailPath = getThumbnailPath(photoId)

    const thumbnailExists = await fsExists(thumbnailPath)
    if (thumbnailExists) {
        await fsUnlink(thumbnailPath)
    }
}
