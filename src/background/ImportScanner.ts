import { BrowserWindow } from 'electron'
import sharp from 'sharp'
import libraw from 'libraw'
import path from 'path'
import moment from 'moment'
import BluebirdPromise from 'bluebird'
import DB from 'sqlite3-helper/no-generators'

import { Photo, Tag, ExifOrientation, ImportProgress, PhotoId } from 'common/CommonTypes'
import config from 'common/config'
import { profileScanner } from 'common/LogConstants'
import { getNonRawPath } from 'common/util/DataUtil'
import { bindMany } from 'common/util/LangUtil'
import Profiler from 'common/util/Profiler'
import { parsePath } from 'common/util/TextUtil'

import ForegroundClient from 'background/ForegroundClient'
import { readMetadataOfImage } from 'background/MetaData'
import { fetchPhotoWork } from 'background/store/PhotoWorkStore'
import { storePhotoTags } from 'background/store/TagStore'
import { fsReadDir, fsReadFile, fsRename, fsStat, fsUnlink } from 'background/util/FileUtil'


const allowed = new RegExp(config.acceptedRawFormats.join('$|') + '$', 'i');
const allowedImg = new RegExp(config.acceptedImgFormats.join('$|') + '$', 'i');

const extract = new RegExp(
    '([^\/]+)\.(' + config.acceptedRawFormats.join('|') + ')$',
    'i'
);

const extractImg = new RegExp(
    '([^\/]+)\.(' + config.acceptedImgFormats.join('|') + ')$',
    'i'
);

const progressUIUpdateInterval = 200  // In ms

let nextTempNonRawImgPathId = 1

interface FileInfo {
    path: string
    imgPath?: string
    name: string
    isRaw: boolean
}

export default class ImportScanner {

    private isScanning = false
    private progress: ImportProgress
    private lastProgressUIUpdateTime = 0
    private updatedTags: Tag[] | null = null

    constructor(private path: string, private versionsPath: string, private mainWindow: BrowserWindow) {
        this.progress = {
            processed: 0,
            total: 0,
            photosDir: this.path
        }
        bindMany(this, 'scanPictures', 'prepare', 'walk', 'onProgressChange', 'filterStoredPhoto', 'setTotal')
    }

    scanPictures(): BluebirdPromise<number | null> {
        if (this.isScanning) {
            // Already scanning
            return BluebirdPromise.resolve(null)
        }

        this.isScanning = true
        this.progress = {
            processed: 0,
            total: 0,
            photosDir: this.path
        }
        this.onProgressChange(true)

        const profiler = profileScanner ? new Profiler('Overall scanning') : null
        return collectFilePaths(this.path, [ this.versionsPath ])
            .then(result => { if (profiler) { profiler.addPoint('Scanned directories') }; return result })
            .then(this.prepare)
            .then(result => { if (profiler) { profiler.addPoint('Prepared files') }; return result })
            .filter(this.filterStoredPhoto)
            .then(result => { if (profiler) { profiler.addPoint('Filtered files') }; return result })
            .then(this.setTotal)
            .then(result => { if (profiler) { profiler.addPoint('Set total') }; return result })
            .map(this.walk, {
                concurrency: config.concurrency
            })
            .then(() => {
                const photoCount = this.progress!.total
                this.isScanning = false
                this.onProgressChange(true)
                if (profiler) {
                    profiler.addPoint(`Scanned ${photoCount} images`)
                    profiler.logResult()
                }
                return photoCount
            })
            .catch(error => {
                if (profiler) {
                    profiler.addPoint('Scanning failed')
                    profiler.logResult()
                }
                this.isScanning = false
                this.onProgressChange(true)
                throw error
            })
    }

    private prepare(filePaths: string[]): FileInfo[] {
        let rawFiles = filePaths.map(filePath =>
            filePath.match(allowed) ? filePath : null
        )
        .filter(filePath => filePath) as string[];

        let imgFiles = filePaths.map(filePath =>
            filePath.match(allowedImg) ? filePath : null
        )
        .filter(filePath => filePath) as string[];

        let preparedFiles = rawFiles.map(rawFile => {
            let filename = rawFile.match(extract)![1];
            let imgPos = matches(imgFiles, filename);

            let element: FileInfo = {
                path: rawFile,
                name: filename,
                isRaw: true
            };

            if (imgPos !== -1) {
                element.imgPath = imgFiles[imgPos];

                imgFiles = imgFiles.filter(imgFile =>
                    imgFile !== imgFiles[imgPos]
                );
            }

            return element;
        });

        imgFiles.forEach(imgFile => {
            let filename = imgFile.match(extractImg)![1];

            preparedFiles.push({
                path: imgFile,
                name: filename,
                isRaw: false
            });
        });

        return preparedFiles;
    }

    private async walk(file: FileInfo): Promise<void> {
        const profiler = profileScanner ? new Profiler(`Importing ${file.path}`) : null

        try {
            // Fetch meta data and PhotoWork

            const masterPath = file.path
            const masterPathParts = parsePath(masterPath)
            const masterDir = masterPathParts.dir || ''
            const masterFileName = masterPathParts.base

            const [ metaData, photoWork, alreadyExists ] = await Promise.all([
                readMetadataOfImage(masterPath),
                fetchPhotoWork(masterDir, masterFileName),
                this.photoExists(masterPath)
            ])
            if (profiler) profiler.addPoint('Fetched meta data and PhotoWork')
            if (alreadyExists) {
                if (profiler) {
                    profiler.addPoint('Photo already exists in DB')
                    profiler.logResult()
                }
                return
            }

            let master_width = metaData.imgWidth
            let master_height = metaData.imgHeight

            let switchSides = (metaData.orientation == ExifOrientation.Left) || (metaData.orientation == ExifOrientation.Right)
            if ((photoWork.rotationTurns || 0) === 1) {
                switchSides = !switchSides
            }

            let createdAt = metaData.createdAt
            if (!createdAt) {
                const stat = await fsStat(masterPath)
                createdAt = stat.mtime
            }

            // Store non-raw version of the photo (only if photo is raw)

            let tempNonRawImgPath: string | null = null
            if (file.isRaw) {
                tempNonRawImgPath = `${config.nonRawPath}/temp-${nextTempNonRawImgPathId++}.${config.workExt}`

                let imgPath: string
                let tempExtractedThumbPath: string | null = null
                if (file.imgPath) {
                    imgPath = file.imgPath
                } else {
                    imgPath = await libraw.extractThumb(
                        file.path,
                        `${config.tmp}/${file.name}`
                    )
                    tempExtractedThumbPath = imgPath
                    if (profiler) profiler.addPoint('Extracted non-raw image')
                }

                const imgBuffer = await fsReadFile(imgPath)
                if (tempExtractedThumbPath) {
                    await fsUnlink(tempExtractedThumbPath)
                }
                if (profiler) profiler.addPoint('Loaded extracted image')

                const outputInfo = await sharp(imgBuffer)
                    .rotate()
                    .withMetadata()
                    .toFile(tempNonRawImgPath)
                master_width = outputInfo.width
                master_height = outputInfo.height
                switchSides = false
                if (profiler) profiler.addPoint('Rotated extracted image')
            }

            // Store photo in DB

            if (!master_width || !master_height) {
                console.error('Detecting photo size failed', file)
                if (profiler) {
                    profiler.addPoint('Detecting photo size failed')
                    profiler.logResult()
                }
                return
            }

            const photo: Photo = {
                id: undefined as any,  // Just set to satisfy type checking (ID will be autogenerated by DB)
                master_dir: masterDir,
                master_filename: masterFileName,
                master_width:  switchSides ? master_height : master_width,
                master_height: switchSides ? master_width : master_height,
                master_is_raw: file.isRaw ? 1 : 0,
                orientation: metaData.orientation,
                date: moment(createdAt).format('YYYY-MM-DD'),
                flag: photoWork.flagged ? 1 : 0,
                trashed: 0,
                created_at: createdAt,
                updated_at: null,
                camera: metaData.camera,
                exposure_time: metaData.exposureTime,
                iso: metaData.iso,
                aperture: metaData.aperture,
                focal_length: metaData.focalLength
            }
            photo.id = await DB().insert('photos', photo)
            if (tempNonRawImgPath) {
                const nonRawPath = getNonRawPath(photo)
                if (nonRawPath === masterPath) {
                    // Should not happen - but we check this just to be shure...
                    throw new Error(`Expected non-raw path to differ original image path: ${nonRawPath}`)
                }
                await fsRename(tempNonRawImgPath, nonRawPath)
            }
            if (profiler) profiler.addPoint('Stored photo to DB')

            // Store tags in DB

            const tags = photoWork.tags || metaData.tags
            if (tags && tags.length) {
                const updatedTags = await storePhotoTags(photo.id, tags)
                if (updatedTags) {
                    this.updatedTags = updatedTags
                }
                if (profiler) profiler.addPoint(`Added ${tags.length} tags`)
            }

            // Update progress

            this.progress.processed++
            this.onProgressChange()
            if (profiler) { profiler.addPoint('Updated import progress') }
        } catch (error) {
            // TODO: Show error in UI
            console.error('Importing photo failed', file, error)
            if (profiler) { profiler.addPoint('Caught error') }
        }
        if (profiler) {
            profiler.logResult()
        }
    }

    private onProgressChange(forceSendingNow?: boolean) {
        const now = Date.now()
        if (forceSendingNow || now > this.lastProgressUIUpdateTime + progressUIUpdateInterval) {
            this.lastProgressUIUpdateTime = now
            ForegroundClient.setImportProgress(this.isScanning ? this.progress : null, this.updatedTags)
            this.updatedTags = null
        }
    }

    private photoExists(originalImgPath: string): Promise<boolean> {
        const pathParts = parsePath(originalImgPath)
        return DB().queryFirstCell<0 | 1>('select exists(select 1 from photos where master_dir = ? and master_filename = ?)', pathParts.dir, pathParts.base)
            .then(rawBoolean => !!rawBoolean)
    }

    private filterStoredPhoto(fileInfo: FileInfo) {
        return this.photoExists(fileInfo.path)
            .then(photoExists => !photoExists)
    }

    private setTotal(files) {
        this.progress.total = files.length;
        return files;
    }

}


function collectFilePaths(dirName: string, blacklist: string[]): BluebirdPromise<string[]> {
    if (blacklist.indexOf(dirName) !== -1) {
        return BluebirdPromise.resolve([])
    }

    return fsReadDir(dirName)
        .map(fileName => {
            const fullPath = path.join(dirName, fileName)

            return fsStat(fullPath)
                .then(stat => stat.isDirectory() ? collectFilePaths(fullPath, blacklist) : [ fullPath ])
        })
        .reduce<string[], string[]>((result, item) => result.concat(item), [])
}


function matches(array: string[], value: string): number {
    for (let i = 0, il = array.length; i < il; i++) {
        const item = array[i]
        if (item.match(value)) {
            return i
        }
    }
    return -1
}
