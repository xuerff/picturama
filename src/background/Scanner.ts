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


const readFile = BluebirdPromise.promisify(fs.readFile)

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

    walk(file: FileInfo): Promise<void> {
        const overallProfiler = profileScanner ? new Profiler(`Importing ${file.path} (overall)`) : null

        const originalImgPath = file.path

        const metaDataProfiler = profileScanner ? new Profiler(`Importing ${file.path} (meta data)`) : null
        const readMetaData = readMetadataOfImage(originalImgPath)
            .then(result => {
                if (metaDataProfiler) {
                    metaDataProfiler.addPoint('Read meta data')
                    metaDataProfiler.logResult()
                }
                return result
            })

        const photoWorkProfiler = profileScanner ? new Profiler(`Importing ${file.path} (photo work)`) : null
        const readPhotoWork = fetchPhotoWork(originalImgPath)
            .then(result => {
                if (photoWorkProfiler) {
                    photoWorkProfiler.addPoint('Fetched photo work')
                    photoWorkProfiler.logResult()
                }
                return result
            })

        let overallPromise: Promise<PhotoType | null> = Promise.all([readMetaData, readPhotoWork])
            .then(results => {
                if (overallProfiler) overallProfiler.addPoint('Waited for meta data and PhotoWork')

                const [ metaData, photoWork ] = results

                return this.photoExists(originalImgPath)
                    .then(alreadyExists => {
                        if (overallProfiler) overallProfiler.addPoint('Fetched from DB')
                        if (alreadyExists) {
                            return null
                        }

                        const photo: PhotoType = {
                            id: generatePhotoId(),
                            title: file.name,
                            master: originalImgPath,
                            master_width: metaData.imgWidth,
                            master_height: metaData.imgHeight,
                            non_raw: null,   // Will be set further down for raw images
                            extension: file.path.match(/\.(.+)$/i)[1],
                            orientation: metaData.orientation,
                            date: moment(metaData.createdAt).format('YYYY-MM-DD'),
                            flag: photoWork.flagged ? 1 : 0,
                            trashed: 0,
                            created_at: metaData.createdAt,
                            updated_at: null,
                            exposure_time: metaData.exposureTime,
                            iso: metaData.iso,
                            aperture: metaData.aperture,
                            focal_length: metaData.focalLength
                        }

                        return DB().insert('photos', photo)
                            .then(() => photo)
                    })
                    .then(photo => {
                        if (overallProfiler) overallProfiler.addPoint('Stored to DB')
                        if (photo) {
                            this.populateTags(photo, metaData.tags)
                            if (overallProfiler) overallProfiler.addPoint('Populated tags')
                        }
                        return photo
                    })
            })

        if (file.isRaw) {
            overallPromise = overallPromise
                .then(photo => {
                    if (!photo) {
                        return null
                    }

                    const nonRawImgPath = file.isRaw ? `${config.nonRawPath}/${photo.id}.${config.workExt}` : null

                    let extractThumb: Promise<string>
                    if (file.hasOwnProperty('imgPath')) {
                        extractThumb = Promise.resolve(file.imgPath)
                    } else {
                        extractThumb = libraw.extractThumb(
                            file.path,
                            `${config.tmp}/${file.name}`
                        )
                    }

                    return extractThumb
                        .then(imgPath => {
                            if (overallProfiler) overallProfiler.addPoint('Extracted non-raw image')
                            return readFile(imgPath)
                        })
                        .then(img => {
                            if (overallProfiler) overallProfiler.addPoint('Loaded extracted image')
                            return sharp(img)
                                .rotate()
                                .withMetadata()
                                .toFile(nonRawImgPath)
                        })
                        .then(outputInfo => {
                            if (overallProfiler) overallProfiler.addPoint('Rotated extracted image')
                            return DB().update<PhotoType>('photos', { non_raw: nonRawImgPath, master_width: outputInfo.width, master_height: outputInfo.height }, photo.id)
                        })
                        .then(() => { if (overallProfiler) { overallProfiler.addPoint('Updated non-raw image path in DB') }; return photo })
                })
        }
    
        return overallPromise
            .then(this.onImportedStep)
            .then(() => {
                if (overallProfiler) {
                    overallProfiler.addPoint('Updated import progress')
                    overallProfiler.logResult()
                }
            })
            .catch(err => {
                console.error('Importing photo failed', file, err)
            })
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
