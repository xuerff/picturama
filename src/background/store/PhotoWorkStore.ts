import { dirname, basename } from 'path'
import fs from 'fs'
import readline from 'readline'
import { promisify } from 'bluebird'
import stringify from 'json-stringify-pretty-compact'

import { PhotoWork } from 'common/CommonTypes'
import { rotate } from 'common/util/EffectsUtil'
import { assertMainProcess } from 'common/util/ElectronUtil'
import SerialJobQueue from 'common/util/SerialJobQueue'


const readFile = promisify<Buffer, string>(fs.readFile)
const writeFile = promisify<void, string, any>(fs.writeFile)
const unlink = promisify<void, string | Buffer>(fs.unlink)


async function exists(path: string | Buffer): Promise<boolean> {
    return new Promise<boolean>(resolve => fs.exists(path, resolve))
}


declare global {
    interface JSON {
        parse(text: Buffer, reviver?: (key: any, value: any) => any): any
    }
}


assertMainProcess()


/** The data as it is stored in ansel.json */
interface DirectoryWorkData {
    photos: { [key:string]: PhotoWork }
}

/** The rules of a picasa.ini for one photo */
type PicasaRules = string[]

/** Data parsed from picasa.ini */
interface PicasaData {
    photos: { [key:string]: PicasaRules }
}

/** All work data we have about one directory */
interface DirectoryData {
    anselData: DirectoryWorkData,
    picasaData?: PicasaData
}


const refetchInterval = 30000
const storeDelay = 2000


class DirectoryWork {

    private data: DirectoryData | null = null
    private lastFetchTime: number = 0
    private runningFetch: Promise<DirectoryData> | null = null
    private isStoreRunning: boolean = false
    private needsStoreFollowup: boolean = false


    constructor(public directoryPath: string) {
    }


    public isIdle(): boolean {
        return !this.runningFetch && !this.isStoreRunning && !this.needsStoreFollowup
    }


    private async fetchData(): Promise<DirectoryData> {
        if (this.data && (this.isStoreRunning || this.needsStoreFollowup || Date.now() < this.lastFetchTime + refetchInterval)) {
            return this.data
        } else if (this.runningFetch) {
            return this.runningFetch
        } else {
            this.runningFetch = Promise.all(
                [
                    fetchAnselJson(this.directoryPath),
                    fetchPicasaIni(this.directoryPath)
                ])
                .then(results => {
                    const [ anselData, picasaData ] = results
                    return { anselData, picasaData: picasaData || undefined }
                })

            this.runningFetch.then(
                data => {
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

        let photoWork = data.anselData.photos[photoBasename]

        if (!photoWork && data.picasaData) {
            const picasaRules = data.picasaData.photos[photoBasename]
            if (picasaRules) {
                photoWork = createPhotoWorkFromPicasaRules(picasaRules, this.directoryPath, photoBasename)
            }
        }

        return photoWork || {}
    }

    public async storePhotoWork(photoBasename: string, photoWork: PhotoWork) {
        // Why `toCanonical`?
        // We store the photos in canonical order (with sorted keys) so a `ansel.json` file produces less conflicts when version controlled.

        const data = await this.fetchData()
        const anselData = data.anselData

        const isEmpty = Object.keys(photoWork).length === 0
        if (isEmpty) {
            delete anselData.photos[photoBasename]
        } else {
            photoWork = toCanonical(photoWork)
            anselData.photos[photoBasename] = photoWork

            const isNew = !anselData.photos[photoBasename]
            if (isNew) {
                // This is a new photo
                // -> We have to sort the keys
                anselData.photos = toCanonical(anselData.photos)
            }
        }

        this.onDataChanged()
    }

    private onDataChanged() {
        if (this.isStoreRunning) {
            this.needsStoreFollowup = true
            return
        }

        this.isStoreRunning = true
        const directoryWorkFile = this.directoryPath + '/ansel.json'
        const storePromise =
            (async () => {
                await new Promise(resolve => setTimeout(resolve, storeDelay))
                this.needsStoreFollowup = false
                const anselData = this.data && this.data.anselData
                const isEmpty = !anselData || Object.keys(anselData.photos).length === 0
                if (isEmpty) {
                    if (await exists(directoryWorkFile)) {
                        await unlink(directoryWorkFile)
                        console.log('Removed empty ' + directoryWorkFile)
                    }
                } else {
                    const json = stringify(anselData)
                    await writeFile(directoryWorkFile, json)
                    console.log('Stored ' + directoryWorkFile)
                }
            })()
            .then(() => {
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


async function fetchAnselJson(directoryPath: string): Promise<DirectoryWorkData> {
    const directoryWorkFile = directoryPath + '/ansel.json'
    if (! await exists(directoryWorkFile)) {
        return { photos: {} }
    } else {
        const buffer = await readFile(directoryWorkFile)
        const anselData = JSON.parse(buffer) as DirectoryWorkData
        console.log('Fetched ' + directoryWorkFile)
        return anselData
    }
}


const sectionStartRegExp = /^\[(.*)\]$/

async function fetchPicasaIni(directoryPath: string): Promise<PicasaData | null> {
    let picasaFile = directoryPath + '/.picasa.ini'
    if (! await exists(picasaFile)) {
        picasaFile = directoryPath + '/Picasa.ini'
        if (! await exists(picasaFile)) {
            return null
        }
    }

    return await new Promise<PicasaData>(
        (resolve, reject) => {
            const picasaData: PicasaData = { photos: {} }

            const lineReader = readline.createInterface({
                input: fs.createReadStream(picasaFile)
            })

            let currentSectionKey: string | null = null
            let currentSectionRules: string[] = []
            lineReader.on('line', line => {
                try {
                    const match = sectionStartRegExp.exec(line)
                    if (match) {
                        if (currentSectionKey) {
                            picasaData.photos[currentSectionKey] = currentSectionRules
                        }
                        currentSectionKey = match[1]
                        currentSectionRules = []
                    } else {
                        currentSectionRules.push(line)
                    }
                } catch (error) {
                    reject(error)
                }
            })
            lineReader.on('close', () => {
                try {
                    if (currentSectionKey) {
                        picasaData.photos[currentSectionKey] = currentSectionRules
                    }
                    console.log('Fetched ' + picasaFile)
                    resolve(picasaData)
                } catch (error) {
                    reject(error)
                }
            })
        })
}


const rotateRuleRegExp = /^rotate=rotate\((\d+)\)$/
const ignoredRulesRegExp = /^([ \t]*$|backuphash=)/

function createPhotoWorkFromPicasaRules(picasaRules: PicasaRules, directoryPath: string, photoBasename: string): PhotoWork {
    const photoWork: PhotoWork = {}

    let importProblems: string[] | null = null
    let match: RegExpMatchArray | null = null
    for (const rule of picasaRules) {
        if (match = rotateRuleRegExp.exec(rule)) {
            rotate(photoWork, parseInt(match[1]))
        } else if (rule == 'star=yes') {
            photoWork.flagged = true
        } else if (! ignoredRulesRegExp.test(rule)) {
            // Unknown rule
            if (!importProblems) {
                importProblems = []
            }
            importProblems.push('Unknown rule: ' + rule)
        }
    }

    if (importProblems) {
        let msg = `Picasa import is incomplete for ${directoryPath}/${photoBasename}:`
        for (const problem of importProblems) {
            msg += '\n  - ' + problem
        }
        console.warn(msg)
    }

    return photoWork
}


function toCanonical<T extends { [key:string]: any }>(obj: T): T {
    const sortedKeys = Object.keys(obj).sort()
    const sortedObj = {}
    for (const key of sortedKeys) {
        sortedObj[key] = obj[key]
    }
    return sortedObj as T
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


export async function removePhotoWork(photoPath: string): Promise<void> {
    await storePhotoWork(photoPath, {})
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
