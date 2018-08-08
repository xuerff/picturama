import { BrowserWindow } from 'electron'
import * as sharp from 'sharp'
import * as libraw from 'libraw'
import * as fs from 'fs'
import * as moment from 'moment'
import * as Promise from 'bluebird'

import config from '../common/config';
import { readMetadataOfImage } from './MetaData'

import walker from './lib/walker';
import matches from './lib/matches';

import Photo from '../common/models/Photo'
import Tag from '../common/models/Tag'
import { renderThumbnail } from './ForegroundClient'
import { bindMany } from '../common/util/LangUtil'
import { fetchPhotoWork, storeThumbnail } from './PhotoWorkStore'
import { profileScanner } from '../common/LogConstants'
import Profiler from '../common/util/Profiler'


const readFile = Promise.promisify(fs.readFile);

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

    walk(file) {
        const originalImgPath = file.path
        const nonRawImgPath = file.isRaw ? `${config.thumbsPath}/${file.name}.thumb.${config.workExt}` : originalImgPath
        const thumbnailImgPath = `${config.thumbs250Path}/${file.name}.${config.workExt}`

        let createNonRawImg
        if (file.isRaw) {
            let extractThumb
            if (file.hasOwnProperty('imgPath')) {
                extractThumb = Promise.resolve(file.imgPath)
            } else {
                extractThumb = libraw.extractThumb(
                    `${file.path}`,
                    `${config.tmp}/${file.name}`
                )
            }

            const nonRawProfiler = profileScanner ? new Profiler(`Importing ${file.path} (non-raw)`) : null
            createNonRawImg = extractThumb
                .then(imgPath => {
                    if (nonRawProfiler) nonRawProfiler.addPoint('Extracted image')
                    readFile(imgPath)
                })
                .then(img => {
                    if (nonRawProfiler) nonRawProfiler.addPoint('Loaded extracted image')
                    return sharp(img)
                        .rotate()
                        .withMetadata()
                        .toFile(nonRawImgPath)
                })
                .then(() => {
                    if (nonRawProfiler) {
                        nonRawProfiler.addPoint('Rotated extracted image')
                        nonRawProfiler.logResult()
                    }
                    return nonRawImgPath
                })
        } else {
            createNonRawImg = Promise.resolve(originalImgPath)
        }

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

        var thumbnailProfiler: Profiler | null = null
        const createThumbnail = Promise.all([
                createNonRawImg,
                readMetaData,
                readPhotoWork
            ])
            .then(results => {
                if (profileScanner) {
                    thumbnailProfiler = new Profiler(`Importing ${file.path} (thumbnail)`)
                }
                const [ nonRawImgPath, metaData, photoWork ] = results
                return renderThumbnail(nonRawImgPath, metaData.orientation, photoWork)
            })
            .then(thumbnailData => {
                if (thumbnailProfiler) thumbnailProfiler.addPoint('Rendered thumbnail')
                return storeThumbnail(thumbnailImgPath, thumbnailData)
            })
            .then (result => {
                if (thumbnailProfiler) {
                    thumbnailProfiler.addPoint('Stored thumbnail')
                    thumbnailProfiler.logResult()
                }
                return result
            })

        return Promise.all([createThumbnail, readMetaData, readPhotoWork])
            .then(results => {
                const dbProfiler = profileScanner ? new Profiler(`Importing ${file.path} (DB)`) : null
                const metaData = results[1]
                const photoWork = results[2]
                return new Photo({ title: file.name })
                    .fetch()
                    .then(photo => {
                        if (dbProfiler) dbProfiler.addPoint('Fetched from DB')
                        return photo ? null : Photo.forge({
                            title: file.name,
                            extension: file.path.match(/\.(.+)$/i)[1],
                            orientation: metaData.orientation,
                            date: moment(metaData.createdAt).format('YYYY-MM-DD'),
                            flag: photoWork.flagged,
                            created_at: metaData.createdAt,
                            exposure_time: metaData.exposureTime,
                            iso: metaData.iso,
                            aperture: metaData.aperture,
                            focal_length: metaData.focalLength,
                            master: originalImgPath,
                            thumb_250: thumbnailImgPath,
                            thumb: nonRawImgPath
                        })
                        .save()
                    })
                    .then(photo => {
                        if (dbProfiler) dbProfiler.addPoint('Stored to DB')
                        this.populateTags(photo, metaData.tags)
                        if (dbProfiler) {
                            dbProfiler.addPoint('Populated tags')
                            dbProfiler.logResult()
                        }
                    })
            })
            .then(this.onImportedStep)
            .catch(err => {
                console.error('Importing photo failed', file, err)
            })
    }

    populateTags(photo, tags: string[]) {
        if (tags.length > 0) {
            return Promise.each(tags, tagName =>
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

    filterStoredPhoto(file) {
        return new Photo({ master: file.path })
            .fetch()
            .then(photo => !photo);
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
