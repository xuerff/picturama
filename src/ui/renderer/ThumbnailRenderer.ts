import { PhotoType, PhotoWork, getTotalRotationTurns } from '../../common/models/Photo'
import { assertRendererProcess } from '../../common/util/ElectronUtil'
import SerialJobQueue from '../../common/util/SerialJobQueue'
import Profiler from '../../common/util/Profiler'

import { getNonRawImgPath } from '../controller/ImageProvider'
import { updatePhoto } from '../controller/PhotoController'
import PhotoCanvas from './PhotoCanvas'
import { Texture } from './WebGLCanvas'


assertRendererProcess()


type RenderJob = { nonRawImgPath: string, texture: Texture, photo: PhotoType, photoWork: PhotoWork, profiler: Profiler | null }

const queue = new SerialJobQueue(
    (newJob, existingJob) => (newJob.nonRawImgPath === existingJob.nonRawImgPath) ? newJob : null,
    renderNextThumbnail)


// Target row height of our overview (class Grid) is 320px.
// Max width is relatively high in order to get most panorama images with full row height.
const maxThumbnailWidth = 1024
const maxThumbnailHeight = 320

let canvas: PhotoCanvas | null = null


export async function renderThumbnailForPhoto(photo: PhotoType, photoWork: PhotoWork, profiler: Profiler | null = null): Promise<string> {
    if (canvas === null) {
        canvas = new PhotoCanvas()
            .setMaxSize(maxThumbnailWidth, maxThumbnailHeight)
        if (profiler) profiler.addPoint('Created canvas')
    }

    const nonRawImgPath = getNonRawImgPath(photo)
    return canvas.createTextureFromSrc(nonRawImgPath, profiler)
        .then(texture => {
            // Update photo size in DB
            const rotationTurns = getTotalRotationTurns(photo.orientation, photoWork)
            const switchSides = (rotationTurns % 2) === 1
            const master_width = switchSides ? texture.height : texture.width
            const master_height = switchSides ? texture.width : texture.height
            if (master_width !== photo.master_width || photo.master_height !== master_height) {
                updatePhoto(photo, { master_width, master_height })
            }

            // Update thumbnail
            return queue.addJob({ nonRawImgPath, texture, photo, photoWork, profiler })
        })
}


async function renderNextThumbnail(job: RenderJob): Promise<string> {
    const { texture, photo, photoWork, profiler } = job
    if (profiler) profiler.addPoint('Waited in queue')

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
