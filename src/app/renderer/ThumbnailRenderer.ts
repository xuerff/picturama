import { Photo, PhotoWork } from 'common/CommonTypes'
import { getTotalRotationTurns, getNonRawUrl } from 'common/util/DataUtil'
import { assertRendererProcess } from 'common/util/ElectronUtil'
import SerialJobQueue from 'common/util/SerialJobQueue'
import Profiler from 'common/util/Profiler'

import { updatePhoto } from 'app/controller/PhotoController'

import { CameraMetricsBuilder } from './CameraMetrics'
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

let cameraMetricsBuilder = new CameraMetricsBuilder()
    .setCanvasSize({ width: maxThumbnailWidth, height: maxThumbnailHeight })
    .setAdjustCanvasSize(true)
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
        if (profiler) profiler.addPoint('Created canvas')
    }

    const texture = await canvas.createTextureFromSrc(nonRawUrl, profiler)

    // Get camera metrics
    const cameraMetrics = cameraMetricsBuilder
        .setTextureSize({ width: texture.width, height: texture.height })
        .setExifOrientation(photo.orientation)
        .setPhotoWork(photoWork)
        .getCameraMetrics()

    // Update photo size in DB (asynchronously)
    const { cropRect } = cameraMetrics
    if (photo.master_width !== cropRect.width || photo.master_height !== cropRect.height) {
        updatePhoto(photo, { master_width: cropRect.width, master_height: cropRect.height })
    }
    if (profiler) profiler.addPoint('Checked photo size in DB')

    // Render thumbnail
    canvas
        .setBaseTexture(texture)
        .setSize(cameraMetrics.canvasSize)
        .setProjectionMatrix(cameraMetrics.projectionMatrix)
        .setCameraMatrix(cameraMetrics.cameraMatrix)
        .update()
    if (profiler) profiler.addPoint('Rendered canvas')

    if (!canvas.isValid()) {
        throw new Error('Thumbnail canvas not valid')
    }

    const dataUrl = canvas.getElement().toDataURL('image/webp')
    if (profiler) profiler.addPoint('Encoded thumbnail to data URL')
    return dataUrl
}
