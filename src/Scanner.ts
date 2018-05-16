import { BrowserWindow } from 'electron'
import * as sharp from 'sharp'
import * as libraw from 'libraw'
import * as fs from 'fs'
import * as moment from 'moment'
import * as Promise from 'bluebird'

import config from './config';
import { readMetadataOfImage } from './MetaData'

import walker from './lib/walker';
import matches from './lib/matches';

import Photo from './models/Photo'
import Tag from './models/Tag'
import { bindMany } from './util/LangUtil'

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

      createNonRawImg = extractThumb
        .then(imgPath => readFile(imgPath))
        .then(img => sharp(img)
          .rotate()
          .withMetadata()
          .toFile(nonRawImgPath)
        )
        .then(() => nonRawImgPath)
    } else {
      createNonRawImg = Promise.resolve(originalImgPath)
    }

    const createThumbnail = createNonRawImg
      .then(() => sharp(nonRawImgPath)
        .rotate()
        .resize(250, 250)
        .max()
        .toFile(thumbnailImgPath)
      )

    const readMetaData = readMetadataOfImage(originalImgPath)

    return Promise.all([createThumbnail, readMetaData])
      .then(results => {
        const metaData = results[1]
        return new Photo({ title: file.name })
          .fetch()
          .then(photo =>
            photo ? null : Photo.forge({
              title: file.name,
              extension: file.path.match(/\.(.+)$/i)[1],
              orientation: metaData.orientation,
              date: moment(metaData.createdAt).format('YYYY-MM-DD'),
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
          )
          .then(photo => this.populateTags(photo, metaData.tags))
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
    return walker(this.path, [ this.versionsPath ])
      .then(this.prepare)
      .filter(this.filterStoredPhoto)
      .then(this.setTotal)
      .map(this.walk, {
        concurrency: config.concurrency
      });
  }
}
