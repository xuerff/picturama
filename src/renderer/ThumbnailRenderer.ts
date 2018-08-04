import { ExifOrientation } from '../models/DataTypes'
import { PhotoType, PhotoWork } from '../models/photo'
import { assertRendererProcess } from '../util/ElectronUtil'
import PhotoCanvas from './PhotoCanvas'
import { Texture } from './WebGLCanvas'
import SerialJobQueue from '../util/SerialJobQueue'
import Profiler from '../util/Profiler'


assertRendererProcess()


type RenderJob = { nonRawImgPath: string, texture: Texture, orientation: ExifOrientation, photoWork: PhotoWork, profiler: Profiler | null }

const queue = new SerialJobQueue(
    (newJob, existingJob) => (newJob.nonRawImgPath === existingJob.nonRawImgPath) ? newJob : null,
    renderNextThumbnail)


const thumbnailSize = 250
let canvas: PhotoCanvas | null = null


export async function renderThumbnailForPhoto(photo: PhotoType, photoWork: PhotoWork, profiler: Profiler | null = null): Promise<string> {
    return await renderThumbnail(photo.thumb, photo.orientation, photoWork, profiler)
}


export async function renderThumbnail(nonRawImgPath: string, orientation: ExifOrientation, photoWork: PhotoWork, profiler: Profiler | null): Promise<string> {
    if (canvas === null) {
        canvas = new PhotoCanvas()
            .setMaxSize(thumbnailSize, thumbnailSize)
        if (profiler) profiler.addPoint('Created canvas')
    }

    return canvas.createTextureFromSrc(nonRawImgPath, profiler)
        .then(texture => {
            return queue.addJob({ nonRawImgPath, texture, orientation, photoWork, profiler })
        })
}


async function renderNextThumbnail(job: RenderJob): Promise<string> {
    const { nonRawImgPath, texture, orientation, photoWork, profiler } = job
    if (profiler) profiler.addPoint('Waited in queue')

    canvas
        .setBaseTexture(texture)
        .setExifOrientation(orientation)
        .setPhotoWork(photoWork)
        .update()
    if (profiler) profiler.addPoint('Rendered canvas')

    if (!canvas.isValid()) {
        throw new Error(`Thumbnail canvas not valid`)
    }

    const dataUrl = canvas.getElement().toDataURL('image/webp')
    if (profiler) profiler.addPoint('Encoded thumbnail to data URL')
    return dataUrl
}
