import { BrowserWindow } from 'electron'
import sharp from 'sharp'
import libraw from 'libraw'
import fs from 'fs'
import moment from 'moment'
import BluebirdPromise from 'bluebird'
import DB from 'sqlite3-helper'

import config from '../common/config';
import { readMetadataOfImage } from './MetaData'

import walker from './lib/walker';
import matches from './lib/matches';

import { PhotoType, generatePhotoId } from '../common/models/Photo'
import Tag from '../common/models/Tag'
import { bindMany } from '../common/util/LangUtil'
import { fetchPhotoWork } from './PhotoWorkStore'
import { profileScanner } from '../common/LogConstants'
import Profiler from '../common/util/Profiler'
import { ExifOrientation } from '../common/models/DataTypes';


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

interface FileInfo {
    path: string
    imgPath?: string
    name: string
    isRaw: boolean
}

export default class Scanner {
    private progress: { processed: number, total: number, photosDir: string }

    constructor(private path: string, private versionsPath: string, private mainWindow: BrowserWindow) {
        this.progress = {
            processed: 0,
            total: 0,
            photosDir: path
        };

        bindMany(this, 'scanPictures', 'prepare', 'setTotal', 'onImportedStep', 'filterStoredPhoto', 'populateTags', 'walk')
    }

    prepare(filePaths: string[]): FileInfo[] {
        let rawFiles = filePaths.map(filePath =>
            filePath.match(allowed) ? filePath : null
        )
        .filter(filePath => filePath);

        let imgFiles = filePaths.map(filePath =>
            filePath.match(allowedImg) ? filePath : null
        )
        .filter(filePath => filePath);

        let preparedFiles = rawFiles.map(rawFile => {
            let filename = rawFile.match(extract)[1];
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
            let filename = imgFile.match(extractImg)[1];

            preparedFiles.push({
                path: imgFile,
                name: filename,
                isRaw: false
            });
        });

        return preparedFiles;
    }

    async walk(file: FileInfo): Promise<void> {
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
            let nonRawImgPath: string = null
            if (file.isRaw) {
                nonRawImgPath = `${config.nonRawPath}/${photoId}.${config.workExt}`

                let imgPath: string
                if (file.hasOwnProperty('imgPath')) {
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
                extension: file.path.match(/\.(.+)$/i)[1],
                orientation: metaData.orientation,
                date: moment(createdAt).format('YYYY-MM-DD'),
                flag: photoWork.flagged ? 1 : 0,
                trashed: 0,
                created_at: createdAt,
                updated_at: null,
                exposure_time: metaData.exposureTime,
                iso: metaData.iso,
                aperture: metaData.aperture,
                focal_length: metaData.focalLength
            }
            await DB().insert('photos', photo)
            if (profiler) profiler.addPoint('Stored photo to DB')

            this.populateTags(photo, metaData.tags)
            if (profiler) profiler.addPoint('Populated tags')

            await this.onImportedStep()
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

    populateTags(photo, tags: string[]) {
        if (tags.length > 0) {
            return BluebirdPromise.each(tags, tagName =>
                new Tag({ title: tagName })
                    .fetch()
                    .then(tag =>
                        tag ? tag : new Tag({ title: tagName }).save()
                    )
                    .then(tag => tag.photos().attach(photo))
            )
            .then(() => photo);
        }

        return photo;
    }

    onImportedStep() {
        this.progress.processed++;
        this.mainWindow.webContents.send('progress', this.progress);
        return true;
    }

    photoExists(originalImgPath: string): Promise<boolean> {
        return DB().queryFirstCell<0 | 1>('select exists(select 1 from photos where master = ?)', originalImgPath)
            .then(rawBoolean => !!rawBoolean)
    }

    filterStoredPhoto(fileInfo: FileInfo) {
        return this.photoExists(fileInfo.path)
            .then(photoExists => !photoExists)
    }

    setTotal(files) {
        this.progress.total = files.length;
        return files;
    }

    scanPictures() {
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
                if (profiler) {
                    profiler.addPoint(`Scanned ${this.progress.total} images`)
                    profiler.logResult()
                }
                return result
            })
      }
}
