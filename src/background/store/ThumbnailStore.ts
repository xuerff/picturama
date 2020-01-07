import config from 'common/config'
import { PhotoId, Photo, PhotoRenderOptions } from 'common/CommonTypes'
import { getMasterPath, getThumbnailPath } from 'common/util/DataUtil'
import { Size } from 'common/util/GeometryTypes'
import { addErrorCode } from 'common/util/LangUtil'
import SerialJobQueue from 'common/util/SerialJobQueue'

import ForegroundClient from 'background/ForegroundClient'
import { fsExists, fsUnlink, fsWriteFile } from 'background/util/FileUtil'
import { parseImageDataUrl } from 'background/util/NodeUtil'

import { fetchPhotoWorkOfPhoto } from './PhotoWorkStore'


// Default row height of 'justified-layout' is 320px.
// Max width is relatively high in order to get most panorama images with full row height.
const maxThumbnailSize: Size = { width: 1024, height: 320 }

const thumbnailRenderOptions: PhotoRenderOptions = {
    format: config.workExt,
    quality: 0.92  // 0.92 is the official default. See: https://developer.mozilla.org/de/docs/Web/API/HTMLCanvasElement/toDataURL
}


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

    const masterPath = getMasterPath(photo)
    const masterExists = await fsExists(masterPath)
    if (!masterExists) {
        throw addErrorCode(new Error(`Photo does not exist: ${masterPath}`), 'master-missing')
    }

    const photoWork = await fetchPhotoWorkOfPhoto(photo)

    const thumbnailDataUrl = await ForegroundClient.renderPhoto(photo, photoWork, maxThumbnailSize, thumbnailRenderOptions)

    await fsWriteFile(thumbnailPath, parseImageDataUrl(thumbnailDataUrl))
    console.log('Stored ' + thumbnailPath)
}


export async function deleteThumbnail(photoId: PhotoId): Promise<void> {
    const thumbnailPath = getThumbnailPath(photoId)

    const thumbnailExists = await fsExists(thumbnailPath)
    if (thumbnailExists) {
        await fsUnlink(thumbnailPath)
    }
}
