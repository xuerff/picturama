import { PhotoType, PhotoEffect } from '../models/photo'
import { assertRendererProcess } from '../util/ElectronUtil'
import PhotoCanvas from './PhotoCanvas'


assertRendererProcess()


class RenderJob {
    promise: Promise<string>
    resolve: (imgData: string) => void
    reject: (error: any) => void
    
    constructor(public photo: PhotoType, public effects: PhotoEffect[]) {
        this.promise = new Promise<string>((resolve, reject) => {
            this.resolve = resolve
            this.reject = reject
        })
    }

}


const thumbnailSize = 250
let canvas: PhotoCanvas | null = null

const renderQueue: RenderJob[] = []
let isJobRunning = false


export async function renderThumbnail(photo: PhotoType, effects: PhotoEffect[]): Promise<string> {
    for (const job of renderQueue) {
        if (job.photo.id === photo.id) {
            // There is already a job for this photo
            // => Update job and share the promise
            job.photo = photo
            job.effects = effects
            return job.promise
        }
    }

    const job = new RenderJob(photo, effects)
    renderQueue.push(job)
    checkQueue()

    return job.promise
}


function checkQueue() {
    if (isJobRunning) {
        return
    }

    const nextJob = renderQueue.shift()
    if (!nextJob) {
        return
    }

    isJobRunning = true
    renderNextJob(nextJob)
        .then(
            thumbailData => nextJob.resolve(thumbailData),
            error => nextJob.reject(error))
        .then(() => {
            isJobRunning = false
            checkQueue()
        })
}


async function renderNextJob(nextJob: RenderJob): Promise<string> {
    if (canvas === null) {
        canvas = new PhotoCanvas()
            .setMaxSize(thumbnailSize, thumbnailSize)
    }

    const { photo, effects } = nextJob

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
