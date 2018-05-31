import { ExifOrientation } from '../models/DataTypes'
import { PhotoType, PhotoWork } from '../models/photo'
import { assertRendererProcess } from '../util/ElectronUtil'
import PhotoCanvas from './PhotoCanvas'
import SerialJobQueue from '../util/SerialJobQueue'


assertRendererProcess()


type RenderJob = { nonRawImgPath: string, orientation: ExifOrientation, photoWork: PhotoWork }

const queue = new SerialJobQueue(
    (newJob, existingJob) => (newJob.nonRawImgPath === existingJob.nonRawImgPath) ? newJob : null,
    renderNextThumbnail)


const thumbnailSize = 250
let canvas: PhotoCanvas | null = null


export async function renderThumbnailForPhoto(photo: PhotoType, photoWork: PhotoWork): Promise<string> {
    return await renderThumbnail(photo.thumb, photo.orientation, photoWork)
}


export async function renderThumbnail(nonRawImgPath: string, orientation: ExifOrientation, photoWork: PhotoWork): Promise<string> {
    return queue.addJob({ nonRawImgPath, orientation, photoWork })
}


async function renderNextThumbnail(job: RenderJob): Promise<string> {
    if (canvas === null) {
        canvas = new PhotoCanvas()
            .setMaxSize(thumbnailSize, thumbnailSize)
    }

    const { nonRawImgPath, orientation, photoWork } = job

    await canvas.loadFromSrc(nonRawImgPath)

    canvas
        .setExifOrientation(orientation)
        .setPhotoWork(photoWork)
        .update()

    if (!canvas.isValid()) {
        throw new Error(`Thumbnail canvas not valid`)
    }

    return canvas.getElement().toDataURL('image/webp')
}
