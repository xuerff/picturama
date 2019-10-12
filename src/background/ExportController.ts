import { parsePath } from 'common/util/TextUtil'
import { Photo, PhotoExportOptions } from 'common/CommonTypes'

import { fetchPhotoWork } from 'background/store/PhotoWorkStore'
import { fsExists, fsWriteFile } from 'background/util/FileUtil'
import { parseImageDataUrl } from 'background/util/NodeUtil'
import ForegroundClient from 'background/ForegroundClient'


export async function exportPhoto(photo: Photo, folderPath: string, options: PhotoExportOptions): Promise<void> {
    const photoWork = await fetchPhotoWork(photo.master_dir, photo.master_filename)
    const imageDataUrl = await ForegroundClient.renderPhoto(photo, photoWork, null, options)

    let exportFilePath: string
    let counter = 1
    const filenameParts = parsePath(photo.master_filename)
    do {
        exportFilePath = `${folderPath}/${filenameParts.name}${counter === 1 ? '' : '_' + counter}.${options.format}`
        counter++
    } while (await fsExists(exportFilePath))

    await fsWriteFile(exportFilePath, parseImageDataUrl(imageDataUrl))
    console.log('Exported ' + exportFilePath)
}
