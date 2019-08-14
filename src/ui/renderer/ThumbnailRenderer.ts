import { Photo, PhotoWork } from 'common/CommonTypes'
import { getTotalRotationTurns, getNonRawUrl } from 'common/util/DataUtil'
import { assertRendererProcess } from 'common/util/ElectronUtil'
import SerialJobQueue from 'common/util/SerialJobQueue'
import Profiler from 'common/util/Profiler'

import { updatePhoto } from 'ui/controller/PhotoController'

import PhotoCanvas from './PhotoCanvas'


assertRendererProcess()


type RenderJob = { nonRawUrl: string, photo: Photo, photoWork: PhotoWork, profiler: Profiler | null }

const queue = new SerialJobQueue(
    (newJob, existingJob) => (newJob.nonRawUrl === existingJob.nonRawUrl) ? newJob : null,
    renderNextThumbnail)


// Default row height of 'justified-layout' is 320px.
// Max width is relatively high in order to get most panorama images with full row height.
const maxThumbnailWidth = 1024
const maxThumbnailHeight = 320

let canvas: PhotoCanvas | null = null


export async function renderThumbnailForPhoto(photo: Photo, photoWork: PhotoWork, profiler: Profiler | null = null): Promise<string> {
    const nonRawUrl = getNonRawUrl(photo)
    return queue.addJob({ nonRawUrl: nonRawUrl, photo, photoWork, profiler })
}


async function renderNextThumbnail(job: RenderJob): Promise<string> {
    const { nonRawUrl, photo, photoWork, profiler } = job
    if (profiler) profiler.addPoint('Waited in queue')

    if (canvas === null) {
        canvas = new PhotoCanvas()
            .setSize({ width: maxThumbnailWidth, height: maxThumbnailHeight })
            .setPhotoPosition('adjust-canvas')
        if (profiler) profiler.addPoint('Created canvas')
    }

    const texture = await canvas.createTextureFromSrc(nonRawUrl, profiler)

    // Update photo size in DB (asynchronously)
    const rotationTurns = getTotalRotationTurns(photo.orientation, photoWork)
    const switchSides = (rotationTurns % 2) === 1
    const master_width = switchSides ? texture.height : texture.width
    const master_height = switchSides ? texture.width : texture.height
    if (master_width !== photo.master_width || photo.master_height !== master_height) {
        updatePhoto(photo, { master_width, master_height })
    }
    if (profiler) profiler.addPoint('Checked photo size in DB')

    // Render thumbnail
    canvas
        .setBaseTexture(texture)
        .setExifOrientation(photo.orientation)
        .setPhotoWork(photoWork)
        .update()
    if (profiler) profiler.addPoint('Rendered canvas')

    if (!canvas.isValid()) {
        throw new Error('Thumbnail canvas not valid')
    }

    const dataUrl = canvas.getElement().toDataURL('image/webp')
    if (profiler) profiler.addPoint('Encoded thumbnail to data URL')
    return dataUrl
}
