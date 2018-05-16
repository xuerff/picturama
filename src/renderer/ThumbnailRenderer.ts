import { ExifOrientation } from '../models/DataTypes'
import { PhotoType, PhotoEffect } from '../models/photo'
import { assertRendererProcess } from '../util/ElectronUtil'
import PhotoCanvas from './PhotoCanvas'
import SerialJobQueue from '../util/SerialJobQueue'


assertRendererProcess()


type RenderJob = { nonRawImgPath: string, orientation: ExifOrientation, effects: PhotoEffect[] }

const queue = new SerialJobQueue(
    (newJob, existingJob) => (newJob.nonRawImgPath === existingJob.nonRawImgPath) ? newJob : null,
    renderNextThumbnail)


const thumbnailSize = 250
let canvas: PhotoCanvas | null = null


export async function renderThumbnailForPhoto(photo: PhotoType, effects: PhotoEffect[]): Promise<string> {
    return await renderThumbnail(photo.thumb, photo.orientation, effects)
}


export async function renderThumbnail(nonRawImgPath: string, orientation: ExifOrientation, effects: PhotoEffect[]): Promise<string> {
    return queue.addJob({ nonRawImgPath, orientation, effects })
}


async function renderNextThumbnail(job: RenderJob): Promise<string> {
    if (canvas === null) {
        canvas = new PhotoCanvas()
            .setMaxSize(thumbnailSize, thumbnailSize)
    }

    const { nonRawImgPath, orientation, effects } = job

    await canvas.loadFromSrc(nonRawImgPath)

    canvas
        .setExifOrientation(orientation)
        .setEffects(effects)
        .update()

    if (!canvas.isValid()) {
        throw new Error(`Thumbnail canvas not valid`)
    }

    return canvas.getElement().toDataURL('image/webp')
}
