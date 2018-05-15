import { PhotoType, PhotoEffect } from '../models/photo'
import { assertRendererProcess } from '../util/ElectronUtil'
import PhotoCanvas from './PhotoCanvas'
import SerialJobQueue from '../util/SerialJobQueue'


assertRendererProcess()


type RenderJob = { photo: PhotoType, effects: PhotoEffect[] }

const queue = new SerialJobQueue(
    (newJob, existingJob) => (newJob.photo.id === existingJob.photo.id) ? newJob : null,
    renderNextThumbnail)


const thumbnailSize = 250
let canvas: PhotoCanvas | null = null


export async function renderThumbnail(photo: PhotoType, effects: PhotoEffect[]): Promise<string> {
    return queue.addJob({ photo, effects })
}


async function renderNextThumbnail(job: RenderJob): Promise<string> {
    if (canvas === null) {
        canvas = new PhotoCanvas()
            .setMaxSize(thumbnailSize, thumbnailSize)
    }

    const { photo, effects } = job

    await canvas.loadFromSrc(photo.thumb)

    canvas
        .setExifOrientation(photo.orientation)
        .setEffects(effects)
        .update()

    if (!canvas.isValid()) {
        throw new Error(`Thumbnail canvas not valid`)
    }

    return canvas.getElement().toDataURL('image/webp')
}
