import { BrowserWindow } from 'electron'
import sharp from 'sharp'
import libraw from 'libraw'
import fs from 'fs'
import moment from 'moment'
import BluebirdPromise from 'bluebird'
import DB from 'sqlite3-helper/no-generators'

import { ExifOrientation, ImportProgress } from 'common/CommonTypes'
import config from 'common/config'
import { profileScanner } from 'common/LogConstants'
import { PhotoType, generatePhotoId } from 'common/models/Photo'
import { TagType } from 'common/models/Tag'
import { bindMany } from 'common/util/LangUtil'
import Profiler from 'common/util/Profiler'

import matches from 'background/lib/matches'
import walker from 'background/lib/walker'
import { fetchPhotoWork } from 'background/store/PhotoWorkStore'
import { storePhotoTags } from 'background/store/TagStore'
import ForegroundClient from 'background/ForegroundClient'
import { readMetadataOfImage } from 'background/MetaData'


const readFile = BluebirdPromise.promisify(fs.readFile)
const fileStat = BluebirdPromise.promisify(fs.stat)

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
    private updatedTags: TagType[] | null = null

    constructor(private path: string, private versionsPath: string, private mainWindow: BrowserWindow) {
        this.progress = {
            processed: 0,
            total: 0,
            photosDir: this.path
        }
        bindMany(this, 'scanPictures', 'prepare', 'walk', 'onProgressChange', 'filterStoredPhoto', 'setTotal')
    }

    scanPictures() {
        if (this.isScanning) {
            // Already scanning
            return
        }

        this.isScanning = true
        this.progress = {
            processed: 0,
            total: 0,
            photosDir: this.path
        }
        this.onProgressChange(true)

        const profiler = profileScanner ? new Profiler('Overall scanning') : null
        return walker(this.path, [ this.versionsPath ])
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
            .then(result => {
                this.isScanning = false
                this.onProgressChange(true)
                if (profiler) {
                    profiler.addPoint(`Scanned ${this.progress!.total} images`)
                    profiler.logResult()
                }
                return result
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
            const originalImgPath = file.path
            const [ metaData, photoWork, alreadyExists ] = await Promise.all([
                readMetadataOfImage(originalImgPath),
                fetchPhotoWork(originalImgPath),
                this.photoExists(originalImgPath)
            ])
            if (profiler) profiler.addPoint('Fetched meta data and PhotoWork')
            if (alreadyExists) {
                if (profiler) {
                    profiler.addPoint('Photo already exists in DB')
                    profiler.logResult()
                }
                return
            }

            const photoId = generatePhotoId()
            let switchSides = (metaData.orientation == ExifOrientation.Left) || (metaData.orientation == ExifOrientation.Right)
            let master_width = metaData.imgWidth
            let master_height = metaData.imgHeight
            let nonRawImgPath: string | null = null
            if (file.isRaw) {
                nonRawImgPath = `${config.nonRawPath}/${photoId}.${config.workExt}`

                let imgPath: string
                if (file.imgPath) {
                    imgPath = file.imgPath
                } else {
                    imgPath = await libraw.extractThumb(
                        file.path,
                        `${config.tmp}/${file.name}`
                    )
                    if (profiler) profiler.addPoint('Extracted non-raw image')
                }

                const imgBuffer = await readFile(imgPath)
                if (profiler) profiler.addPoint('Loaded extracted image')

                const outputInfo = await sharp(imgBuffer)
                    .rotate()
                    .withMetadata()
                    .toFile(nonRawImgPath)
                switchSides = false
                master_width = outputInfo.width
                master_height = outputInfo.height
                if (profiler) profiler.addPoint('Rotated extracted image')
            }
            if (!master_width || !master_height) {
                console.error('Detecting photo size failed', file)
                if (profiler) {
                    profiler.addPoint('Detecting photo size failed')
                    profiler.logResult()
                }
                return
            }

            if ((photoWork.rotationTurns || 0) === 1) {
                switchSides = !switchSides
            }

            let createdAt = metaData.createdAt
            if (!createdAt) {
                const stat = await fileStat(originalImgPath)
                createdAt = stat.mtime
            }

            const photo: PhotoType = {
                id: photoId,
                title: file.name,
                master: originalImgPath,
                master_width:  switchSides ? master_height : master_width,
                master_height: switchSides ? master_width : master_height,
                non_raw: nonRawImgPath,
                extension: file.path.match(/\.(.+)$/i)![1],
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
            await DB().insert('photos', photo)
            if (profiler) profiler.addPoint('Stored photo to DB')

            const tags = photoWork.tags || metaData.tags
            if (tags && tags.length) {
                const updatedTags = await storePhotoTags(photoId, tags)
                if (updatedTags) {
                    this.updatedTags = updatedTags
                }
                if (profiler) profiler.addPoint(`Added ${tags.length} tags`)
            }

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
        return DB().queryFirstCell<0 | 1>('select exists(select 1 from photos where master = ?)', originalImgPath)
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
