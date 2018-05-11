import { dirname, basename } from 'path'
import * as fs from 'fs'
import { promisify } from 'bluebird'

import { PhotoWork } from './models/Photo'
import { assertMainProcess } from './util/ElectronUtil'


const readFile = promisify<Buffer, string>(fs.readFile)
const writeFile = promisify<void, string, any>(fs.writeFile)


async function exists(path: string | Buffer): Promise<boolean> {
    return new Promise<boolean>(resolve => fs.exists(path, resolve))
}


declare global {
    interface JSON {
        parse(text: Buffer, reviver?: (key: any, value: any) => any): any
    }
}


assertMainProcess()


interface DirectoryWork {
    photos: { [key:string]: PhotoWork }
}


export async function fetchPhotoWork(photoPath: string): Promise<PhotoWork> {
    const directoryPath = dirname(photoPath)
    const photoBasename = basename(photoPath)

    const directoryWork = await fetchDirectoryWork(directoryPath)
    let photoWork = directoryWork.photos[photoBasename]
    return photoWork || { effects: [] }
}


export async function storePhotoWork(photoPath: string, photoWork: PhotoWork): Promise<void> {
    const directoryPath = dirname(photoPath)
    let directoryWork = await fetchDirectoryWork(directoryPath)

    const photoBasename = basename(photoPath)
    const isNew = !directoryWork.photos[photoBasename]
    directoryWork.photos[photoBasename] = photoWork

    if (isNew) {
        // This is a new photo. We store the photos in canonical order so a `.ansel.json` file produces less conflicts when version controlled.
        // -> Create a photos map with sorted keys
        const prevPhotos = directoryWork.photos
        const sortedPhotoNames = Object.keys(directoryWork.photos).sort()
        const sortedPhotos = {}
        for (const photoName of sortedPhotoNames) {
            sortedPhotos[photoName] = prevPhotos[photoName]
        }
        directoryWork.photos = sortedPhotos
    }

    directoryWork.photos[photoBasename] = photoWork
    await storeDirectoryWork(directoryPath, directoryWork)
}


async function fetchDirectoryWork(directoryPath: string): Promise<DirectoryWork> {
    const directoryWorkFile = directoryPath + '/.ansel.json'
    if (! await exists(directoryWorkFile)) {
        return { photos: {} }
    } else {
        let buffer = await readFile(directoryWorkFile)
        return JSON.parse(buffer) as DirectoryWork
    }
}


async function storeDirectoryWork(directoryPath: string, directoryWork: DirectoryWork): Promise<void> {
    const directoryWorkFile = directoryPath + '/.ansel.json'
    const json = JSON.stringify(directoryWork, null, 2)
    await writeFile(directoryWorkFile, json)
}
