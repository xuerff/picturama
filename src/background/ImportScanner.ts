import sharp from 'sharp'
import moment from 'moment'
import BluebirdPromise from 'bluebird'
import DB from 'sqlite3-helper/no-generators'
import notifier from 'node-notifier'

import { Photo, Tag, ExifOrientation, ImportProgress, PhotoId } from 'common/CommonTypes'
import { profileScanner } from 'common/LogConstants'
import config from 'common/config'
import { msg } from 'common/i18n/i18n'
import { getNonRawPath } from 'common/util/DataUtil'
import { bindMany } from 'common/util/LangUtil'
import Profiler from 'common/util/Profiler'
import { formatNumber } from 'common/util/TextUtil'

import AppWindowController from 'background/AppWindowController'
import ForegroundClient from 'background/ForegroundClient'
import { readMetadataOfImage } from 'background/MetaData'
import { deletePhotos } from 'background/store/PhotoStore'
import { fetchPhotoWork } from 'background/store/PhotoWorkStore'
import { fetchSettings } from 'background/store/SettingsStore'
import { storePhotoTags, fetchTags } from 'background/store/TagStore'
import { toSqlStringCsv } from 'background/util/DbUtil'
import { fsReadDirWithFileTypes, fsReadFile, fsRename, fsStat, fsUnlink, fsExists } from 'background/util/FileUtil'


const acceptedRawExtensionRE = new RegExp(`\\.(${config.acceptedRawExtensions.join('|')})$`, 'i')
const acceptedExtensionRE = new RegExp(`\\.(${config.acceptedNonRawExtensions.join('|')}|${config.acceptedRawExtensions.join('|')})$`, 'i')

const uiUpdateInterval = 200  // In ms

let libraw: any | false | null = null

let nextTempRawConversionId = 1

interface DirectoryInfo {
    path: string
    photoFilenames: string[]
}

let importScanner: ImportScanner | null = null


export function startImport(): void {
    if (!importScanner) {
        importScanner = new ImportScanner()
    }
    importScanner.scanPhotos()
        .catch(error => {
            // TODO: Show error in UI
            console.error('Scanning photos failed', error)
        })
}


class ImportScanner {

    private state: 'idle' | 'scan-dirs' | 'cleanup' | 'import-photos' = 'idle'

    private importStartTime = 0

    private progress: ImportProgress
    private shouldFetchTags = false
    private lastUIUpdateTime = 0
    private isUIUpdateRunning = false
    private needsFollowupUIUpdate = false


    constructor() {
        bindMany(this, 'processDirectory')
        this.reset()
    }

    private reset() {
        this.state = 'idle'
        this.progress = {
            phase: 'scan-dirs',
            total: 0,
            processed: 0,
            added: 0,
            removed: 0,
            currentPath: null
        }
    }

    scanPhotos(): BluebirdPromise<void> {
        if (this.state != 'idle') {
            // Already scanning
            return BluebirdPromise.resolve()
        }

        const startTime = Date.now()
        const profiler = profileScanner ? new Profiler('Import scanning') : null

        this.reset()
        this.state = 'scan-dirs'
        this.importStartTime = Date.now()
        this.progress.phase = 'scan-dirs'
        this.onProgressChange(true)

        if (libraw === null) {
            try {
                libraw = require('libraw')
            } catch (error) {
                libraw = false
                console.warn('libraw is not supported', error)
            }
        }

        const dirs: DirectoryInfo[] = []
        return BluebirdPromise.cast(fetchSettings())
            .then(settings => removeSubdirectories(settings.photoDirs))
            .reduce(async (result: DirectoryInfo[], path) => {
                const pathExists = await fsExists(path)
                if (!pathExists) {
                    console.warn('Import path does not exist: ' + path)
                    return
                }

                const stats = await fsStat(path)
                if (!stats.isDirectory()) {
                    console.warn('Import path is no directory: ' + path)
                    return
                }

                await this.scanDirectory(result, path)

                return result
            }, dirs)
            .then(async () => {
                if (profiler) { profiler.addPoint(`Scanned directories (${this.progress.total} photos in ${dirs.length} directories)`) }

                // Delete photos of removed directories

                this.state = 'cleanup'
                this.progress.phase = 'cleanup'
                this.onProgressChange(true)

                const dirsCsv = toSqlStringCsv(dirs.map(dirInfo => dirInfo.path))
                let photoIds = await DB().queryColumn<PhotoId>('id', `select id from photos where master_dir not in (${dirsCsv})`)
                await this.deletePhotos(photoIds)
                if (profiler) { profiler.addPoint(`Deleted ${photoIds.length} photos of removed directories`) }

                this.state = 'import-photos'
                this.progress.phase = 'import-photos'
                this.onProgressChange(true)

                return dirs
            })
            .map(this.processDirectory, { concurrency: config.concurrency })
            .then(() => {
                const photoCount = this.progress.total
                if (profiler) profiler.addPoint(`Scanned ${photoCount} images`)
                this.reset()

                const duration = Date.now() - startTime
                console.log(`Finished scanning ${photoCount} photos in ${duration} ms`)
                notifier.notify({
                    title: 'Ansel',
                    message: msg('ImportScanner_importFinished', formatNumber(photoCount), moment.duration(duration).humanize())
                })
            })
            .catch(error => {
                if (profiler) profiler.addPoint('Scanning failed')
                this.progress.phase = 'error'
                this.onProgressChange(true)
                throw error
            })
            .lastly(() => {
                if (profiler) profiler.logResult()
                this.state = 'idle'
                this.onProgressChange(true)
            })
    }

    private async scanDirectory(result: DirectoryInfo[], dir: string): Promise<void> {
        const photoFilenames: string[] = []
        const files = await fsReadDirWithFileTypes(dir)
        await Promise.all(files.map(async fileInfo => {
            const filename = fileInfo.name
            const filePath = `${dir}/${filename}`
            if (fileInfo.isDirectory()) {
                await this.scanDirectory(result, filePath)
            } else if (fileInfo.isFile()) {
                if (acceptedExtensionRE.test(filename)) {
                    photoFilenames.push(filename)
                }
            }
        }))

        if (photoFilenames.length) {
            result.push({ path: dir, photoFilenames })
            this.progress.total += photoFilenames.length
            this.onProgressChange()
        }
    }

    private async deletePhotos(photoIds: PhotoId[]): Promise<void> {
        if (!photoIds.length) {
            return
        }

        const shouldFetchTags = await deletePhotos(photoIds)
        if (shouldFetchTags) {
            this.shouldFetchTags = shouldFetchTags
        }

        this.progress.removed += photoIds.length
        this.onProgressChange()
    }

    private async processDirectory(dirInfo: DirectoryInfo) {
        this.progress.currentPath = dirInfo.path

        type PhotoInfo = { id: PhotoId, master_filename: string }
        const photosInDb = await DB().query<PhotoInfo>(
            'select id, master_filename from photos where master_dir = ?', dirInfo.path)

        const remainingPhotosMap: { [K in string]: PhotoInfo } = {}
        for (const photo of photosInDb) {
            remainingPhotosMap[photo.master_filename] = photo
        }

        for (const filename of dirInfo.photoFilenames) {
            this.progress.processed++

            const photo = remainingPhotosMap[filename]
            if (photo) {
                // This photo already exists in the DB
                delete remainingPhotosMap[filename]

                // Don't call `onProgressChange` - delete is too fast (progress will be updated after the next "real" operation)
            } else {
                // This is a new photo -> Import it
                const importSucceed = await this.importPhoto(dirInfo.path, filename)
                if (importSucceed) {
                    this.progress.added++
                    this.onProgressChange()
                }
            }
        }
        this.onProgressChange()

        const removedIds = Object.values(remainingPhotosMap).map(photo => photo.id)
        await this.deletePhotos(removedIds)
    }

    private async importPhoto(masterDir: string, masterFileName: string): Promise<boolean> {
        const masterFullPath = `${masterDir}/${masterFileName}`
        const profiler = profileScanner ? new Profiler(`Importing ${masterFullPath}`) : null

        try {
            const isRaw = acceptedRawExtensionRE.test(masterFileName)
            if (isRaw && !libraw) {
                return false
            }

            // Fetch meta data and PhotoWork

            const [ fileStats, metaData, photoWork ] = await Promise.all([
                fsStat(masterFullPath),
                readMetadataOfImage(masterFullPath),
                fetchPhotoWork(masterDir, masterFileName),
            ])
            if (profiler) profiler.addPoint('Fetched meta data and PhotoWork')

            let master_width = metaData.imgWidth
            let master_height = metaData.imgHeight

            let switchSides = (metaData.orientation == ExifOrientation.Left) || (metaData.orientation == ExifOrientation.Right)
            if ((photoWork.rotationTurns || 0) === 1) {
                switchSides = !switchSides
            }

            let createdAt = metaData.createdAt || fileStats.ctime

            // Store non-raw version of the photo (only if photo is raw)

            let tempNonRawImgPath: string | null = null
            if (isRaw) {
                const tempRawConversionId = nextTempRawConversionId++
                tempNonRawImgPath = `${config.nonRawPath}/temp-${tempRawConversionId}.${config.workExt}`

                const tempExtractedThumbPath = await libraw.extractThumb(masterFullPath, `${config.tmp}/non-raw-${tempRawConversionId}.jpg`)
                if (profiler) profiler.addPoint('Extracted non-raw image')

                const imgBuffer = await fsReadFile(tempExtractedThumbPath)
                await fsUnlink(tempExtractedThumbPath)
                if (profiler) profiler.addPoint('Loaded extracted image')

                const outputInfo = await sharp(imgBuffer)
                    .rotate()
                    .withMetadata()
                    .toFile(tempNonRawImgPath)
                master_width = outputInfo.width
                master_height = outputInfo.height
                switchSides = false
                if (profiler) profiler.addPoint('Rotated and transcoded extracted image')
            }

            // Store photo in DB

            if (!master_width || !master_height) {
                console.error('Detecting photo size failed', masterFullPath)
                if (profiler) {
                    profiler.addPoint('Detecting photo size failed')
                    profiler.logResult()
                }
                return false
            }

            const photo: Photo = {
                id: undefined as any,  // Just set to satisfy type checking (ID will be autogenerated by DB)
                master_dir: masterDir,
                master_filename: masterFileName,
                master_width:  switchSides ? master_height : master_width,
                master_height: switchSides ? master_width : master_height,
                master_is_raw: isRaw ? 1 : 0,
                date_section: moment(createdAt).format('YYYY-MM-DD'),
                created_at: createdAt.getTime(),
                updated_at: fileStats.mtime.getTime(),
                imported_at: this.importStartTime,
                orientation: metaData.orientation,
                camera: metaData.camera,
                exposure_time: metaData.exposureTime,
                iso: metaData.iso,
                focal_length: metaData.focalLength,
                aperture: metaData.aperture,
                flag: photoWork.flagged ? 1 : 0,
                trashed: 0,
            }
            photo.id = await DB().insert('photos', photo)
            if (tempNonRawImgPath) {
                const nonRawPath = getNonRawPath(photo)
                if (nonRawPath === masterFullPath) {
                    // Should not happen - but we check this just to be shure...
                    throw new Error(`Expected non-raw path to differ original image path: ${nonRawPath}`)
                }
                await fsRename(tempNonRawImgPath, nonRawPath)
            }
            if (profiler) profiler.addPoint('Stored photo to DB')

            // Store tags in DB

            const tags = photoWork.tags || metaData.tags
            if (tags && tags.length) {
                const shouldUpdateTags = await storePhotoTags(photo.id, tags)
                if (shouldUpdateTags) {
                    this.shouldFetchTags = true
                }
                if (profiler) profiler.addPoint(`Added ${tags.length} tags`)
            }

            // Done

            if (profiler) profiler.logResult()
            return true
        } catch (error) {
            // TODO: Show error in UI
            console.error('Importing photo failed', masterFullPath, error)
            if (profiler) {
                profiler.addPoint('Caught error')
                profiler.logResult()
            }
            return false
        }
    }

    private onProgressChange(forceSendingNow?: boolean) {
        const now = Date.now()
        if (forceSendingNow || now > this.lastUIUpdateTime + uiUpdateInterval) {
            if (this.isUIUpdateRunning) {
                this.needsFollowupUIUpdate = true
            } else {
                this.isUIUpdateRunning = true
                this.needsFollowupUIUpdate = false
                this.lastUIUpdateTime = now
                Promise.resolve()
                    .then(async () => {
                        const { state, progress } = this

                        let updatedTags: Tag[] | null = null
                        if (this.shouldFetchTags) {
                            updatedTags = await fetchTags()
                            this.shouldFetchTags = false
                        }

                        let progressBarProgress = 0
                        if (state === 'idle') {
                            progressBarProgress = -1  // Don't show progress
                        } else if (state === 'import-photos') {
                            progressBarProgress = progress.processed / (progress.total || 1)
                        } else {
                            progressBarProgress = 2  // indeterminate
                        }
                        AppWindowController.getAppWindow().setProgressBar(progressBarProgress)

                        await ForegroundClient.setImportProgress(state === 'idle' ? null : progress, updatedTags)

                        this.isUIUpdateRunning = false
                        if (this.needsFollowupUIUpdate) {
                            this.onProgressChange(true)
                        }
                    })
                    .catch(error => {
                        this.isUIUpdateRunning = false
                        // TODO: Show error in UI
                        console.error('Notifying progress failed', error)
                    })
            }
        }
    }

}


/**
 * Returns a copy of `paths` where all duplicate directories or subdirectories have been removed.
 *
 * E.g. [ '/my/pics', '/my/pics/special', '/my/pics' ]  ->  [ '/my/pics' ]
 */
function removeSubdirectories(paths: string[]): string[] {
    const result: string[] = [ ...paths ]
    for (let i = result.length - 1; i >= 0; i--) {
        const path = result[i]

        let isSubdirectory = false
        for (let j = 0; j < result.length; j++) {
            if (j !== i && path.startsWith(result[j])) {
                isSubdirectory = true
                break
            }
        }

        if (isSubdirectory) {
            result.splice(i, 1)
        }
    }
    return result
}
