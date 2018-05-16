import { dirname, basename } from 'path'
import * as fs from 'fs'
import { promisify } from 'bluebird'

import { PhotoWork } from './models/Photo'
import { assertMainProcess } from './util/ElectronUtil'
import SerialJobQueue from './util/SerialJobQueue'


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


interface DirectoryWorkData {
    photos: { [key:string]: PhotoWork }
}


const refetchInterval = 30000
const storeDelay = 2000


class DirectoryWork {

    private data: DirectoryWorkData | null = null
    private lastFetchTime: number = 0
    private runningFetch: Promise<DirectoryWorkData>
    private isStoreRunning: boolean = false
    private needsStoreFollowup: boolean = false


    constructor(public directoryPath: string) {
    }


    public isIdle(): boolean {
        return !this.runningFetch && !this.isStoreRunning && !this.needsStoreFollowup
    }


    private async fetchData(): Promise<DirectoryWorkData> {
        if (this.data && (this.isStoreRunning || this.needsStoreFollowup || Date.now() < this.lastFetchTime + refetchInterval)) {
            return this.data
        } else if (this.runningFetch) {
            return this.runningFetch
        } else {
            const directoryWorkFile = this.directoryPath + '/.ansel.json'
            this.runningFetch = (async () => {
                if (! await exists(directoryWorkFile)) {
                    return { photos: {} }
                } else {
                    let buffer = await readFile(directoryWorkFile)
                    return JSON.parse(buffer) as DirectoryWorkData
                }
            })()

            this.runningFetch.then(
                data => {
                    console.log('Fetched ' + directoryWorkFile)
                    this.data = data
                    this.lastFetchTime = Date.now()
                    this.runningFetch = null
                },
                error => {
                    this.runningFetch = null
                })

            return this.runningFetch
        }
    }

    public async fetchPhotoWork(photoBasename: string): Promise<PhotoWork> {
        const data = await this.fetchData()

        let photoWork = data.photos[photoBasename]
        return photoWork || { effects: [] }
    }

    public async storePhotoWork(photoBasename: string, photoWork: PhotoWork) {
        const data = await this.fetchData()

        const isNew = !data.photos[photoBasename]
        data.photos[photoBasename] = photoWork

        if (isNew) {
            // This is a new photo. We store the photos in canonical order so a `.ansel.json` file produces less conflicts when version controlled.
            // -> Create a photos map with sorted keys
            const prevPhotos = data.photos
            const sortedPhotoNames = Object.keys(data.photos).sort()
            const sortedPhotos = {}
            for (const photoName of sortedPhotoNames) {
                sortedPhotos[photoName] = prevPhotos[photoName]
            }
            data.photos = sortedPhotos
        }

        data.photos[photoBasename] = photoWork

        this.onDataChanged()
    }

    private onDataChanged() {
        if (this.isStoreRunning) {
            this.needsStoreFollowup = true
            return
        }

        this.isStoreRunning = true
        const directoryWorkFile = this.directoryPath + '/.ansel.json'
        const storePromise =
            (async () => {
                await new Promise(resolve => setTimeout(resolve, storeDelay))
                this.needsStoreFollowup = false
                const json = JSON.stringify(this.data, null, 2)
                await writeFile(directoryWorkFile, json)
            })()
            .then(() => {
                console.log('Stored ' + directoryWorkFile)
                this.isStoreRunning = false
                if (this.needsStoreFollowup) {
                    this.onDataChanged()
                }
            },
            error => {
                this.isStoreRunning = false
                console.error('Storing directory work failed: ' + this.directoryPath, error)
            })
    }

}


const directoryWorkByPath: { [key:string]: DirectoryWork } = {}
let directoryWorkCacheSize = 0
const maxDirectoryWorkCacheSize = 100


function getDirectoryWork(directoryPath: string): DirectoryWork {
    let directoryWork = directoryWorkByPath[directoryPath]
    if (!directoryWork) {
        if (directoryWorkCacheSize >= maxDirectoryWorkCacheSize) {
            for (const path of Object.keys(directoryWorkByPath)) {
                const cachedDirectoryWork = directoryWorkByPath[path]
                if (cachedDirectoryWork.isIdle()) {
                    delete directoryWorkByPath[path]
                    directoryWorkCacheSize--
                }
            }
        }

        directoryWork = new DirectoryWork(directoryPath)
        directoryWorkByPath[directoryPath] = directoryWork
        directoryWorkCacheSize++
    }
    return directoryWork
}


export async function fetchPhotoWork(photoPath: string): Promise<PhotoWork> {
    const directoryPath = dirname(photoPath)
    const photoBasename = basename(photoPath)

    return getDirectoryWork(directoryPath)
        .fetchPhotoWork(photoBasename)
}


export async function storePhotoWork(photoPath: string, photoWork: PhotoWork): Promise<void> {
    const directoryPath = dirname(photoPath)
    const photoBasename = basename(photoPath)

    return getDirectoryWork(directoryPath)
        .storePhotoWork(photoBasename, photoWork)
}


const storeThumbnailQueue = new SerialJobQueue(
    (newJob, existingJob) => (newJob.thumbnailPath === existingJob.thumbnailPath) ? newJob : null,
    processNextStoreThumbnail)


export async function storeThumbnail(thumbnailPath: string, thumbnailData: string): Promise<void> {
    return storeThumbnailQueue.addJob({ thumbnailPath, thumbnailData })
}


async function processNextStoreThumbnail(job: {thumbnailPath: string, thumbnailData: string}): Promise<void> {
    // thumbnailData is a data URL. Example: 'data:image/webp;base64,UklG...'
    const dataPrefix = 'base64,'
    const base64Data = job.thumbnailData.substr(job.thumbnailData.indexOf(dataPrefix) + dataPrefix.length)
    const dataBuffer = new Buffer(base64Data, 'base64')
    await writeFile(job.thumbnailPath, dataBuffer)
    console.log('Stored ' + job.thumbnailPath)
}
