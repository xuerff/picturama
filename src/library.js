import moment from 'moment';
import watchr from 'watchr';
import sharp from 'sharp';
import notifier from 'node-notifier';
import fs from 'fs';
import Promise from 'bluebird';
import libraw from 'libraw';

import config from './config';

import exifParser from './lib/exif-parser';
import walker from './lib/walker';
import matches from './lib/matches';

import Photo from './models/photo';
import Version from './models/version';

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

class Library {

  constructor(mainWindow) {
    this.mainWindow = mainWindow;

    if (fs.existsSync(config.settings)) {
      let settings = require(config.settings);

      this.path = settings.directories.photos;
      this.versionsPath = settings.directories.versions;

      if (!fs.existsSync(config.thumbsPath))
        fs.mkdirSync(config.thumbsPath);

      if (!fs.existsSync(config.thumbs250Path))
        fs.mkdirSync(config.thumbs250Path);
    }

    if (!fs.existsSync(config.tmp))
      fs.mkdirSync(config.tmp);
  }

  prepare(filePaths) {
    let rawFiles = filePaths.map((filePath) => {
      if (filePath.match(allowed))
        return filePath;
    })
    .filter((filePath) => (filePath));

    let imgFiles = filePaths.map((filePath) => {
      if (filePath.match(allowedImg))
        return filePath;
    })
    .filter((filePath) => (filePath));

    let preparedFiles = rawFiles.map((rawFile) => {
      let filename = rawFile.match(extract)[1];
      let imgPos = matches(imgFiles, filename);

      let element = {
        path: rawFile,
        name: filename,
        isRaw: true
      };

      if (imgPos != -1) {
        element.imgPath = imgFiles[imgPos];

        imgFiles = imgFiles.filter((imgFile) => {
          return (imgFile != imgFiles[imgPos]);
        });
      }

      return element;
    });

    imgFiles.forEach((imgFile) => {
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
    return new Photo({ master: file.path }).fetch().then((photo) => {
      if (photo)
        return false;

      else if (file.isRaw)
        return this.importRaw(file).bind(this);

      else
        return this.importImg(file).bind(this);
    });
  }

  importRaw(file) {
    console.log('raw', file.path);
    let waitFor;

    if (file.hasOwnProperty('imgPath'))
      waitFor = Promise.resolve(file.imgPath);
    else
      waitFor = libraw.extractThumb(
        `${file.path}`,
        `${config.tmp}/${file.name}`
      );

    return waitFor
      .then((imgPath) => {
        return readFile(imgPath);
      })
      .then((img) => {
        return sharp(img)
          .rotate()
          .withMetadata()
          .toFile(`${config.thumbsPath}/${file.name}.thumb.jpg`);
      })
      .then(() => {
        return sharp(`${config.thumbsPath}/${file.name}.thumb.jpg`)
          .resize(250, 250)
          .max()
          .quality(100)
          .toFile(`${config.thumbs250Path}/${file.name}.jpg`);
      })
      .then(() => {
        return exifParser(`${config.thumbsPath}/${file.name}.thumb.jpg`);
      })
      .then((exifData) => {
        let createdAt = moment(
          exifData.image.ModifyDate,
          'YYYY:MM:DD HH:mm:ss'
        );

        let orientation = 1;

        if (exifData.image.hasOwnProperty('Orientation'))
          orientation = exifData.image.Orientation;

        return new Photo({ title: file.name }).fetch().then((photo) => {
          if (photo)
            return;
          else
            return Photo.forge({
              title: file.name,
              extension: file.path.match(/\.(.+)$/i)[1],
              orientation,
              date: createdAt.format('YYYY-MM-DD'),
              created_at: createdAt.toDate(),
              exposure_time: exifData.exif.ExposureTime,
              iso: exifData.exif.ISO,
              aperture: exifData.exif.FNumber,
              focal_length: exifData.exif.FocalLength,
              master: `${file.path}`,
              thumb_250: `${config.thumbs250Path}/${file.name}.jpg`,
              thumb: `${config.thumbsPath}/${file.name}.thumb.jpg`
            })
            .save();
        });
      })
      .catch((err) => {
        console.log('ERR', file, err);
      });
  }

  importImg(file) {
    let start = new Date().getTime();
    let thumbStep;
    let exifStep;
    let metadataStep;

    return Promise.join(
      sharp(file.path)
        .resize(250, 250)
        .max()
        .quality(100)
        .toFile(`${config.thumbs250Path}/${file.name}.jpg`)
        .then(() => {
          thumbStep = new Date().getTime();
          return true;
        }),
      exifParser(file.path)
        .then((exifData) => {
          exifStep = new Date().getTime();
          return exifData;
        }),
      sharp(file.path).metadata()
        .then((metadata) => {
          metadataStep = new Date().getTime();
          return metadata;
        }),
      (img, exifData, metadata) => {
        let createdAt;

        if (exifData.image.hasOwnProperty('ModifyDate'))
          createdAt = moment(
            exifData.image.ModifyDate,
            'YYYY:MM:DD HH:mm:ss'
          );
        else
          createdAt = moment(
            fs.statSync(file.path).birthtime
          );

        let orientation = 1;

        if (exifData.image.hasOwnProperty('Orientation'))
          orientation = exifData.image.Orientation;
        else if (metadata.width < metadata.height)
          orientation = 0;

        // TODO: How to determine orientation from a JPG file?

        return new Photo({ title: file.name }).fetch().then((photo) => {
          if (photo)
            return;
          else
            return Photo.forge({
              title: file.name,
              extension: file.path.match(/\.(.+)$/i)[1],
              orientation,
              date: createdAt.format('YYYY-MM-DD'),
              created_at: createdAt.toDate(),
              exposure_time: exifData.exif.ExposureTime,
              iso: exifData.exif.ISO,
              aperture: exifData.exif.FNumber,
              focal_length: exifData.exif.FocalLength,
              master: file.path,
              thumb_250: `${config.thumbs250Path}/${file.name}.jpg`,
              thumb: file.path
            })
            .save();
        });
      }
    )
    .then(() => {
      let end = new Date().getTime();
      let time = moment.duration(end - start);
      let thumb = moment.duration(thumbStep - start);
      let exif = moment.duration(exifStep - start);
      let metadata = moment.duration(metadataStep - start);

      console.log(`${file.name} thumb:${thumb} exif:${exif} metadata:${metadata} total ${time}`);
    })
    .catch((err) => {
      console.log('err', err);
      return false;
    });
   
  }

  scan() {
    var start = new Date().getTime();

    if (!this.path || !this.versionsPath)
      return false;

    walker(this.path, [ this.versionsPath ])
      .then(this.prepare.bind(this))
      .map(this.walk.bind(this), {
        concurrency: config.concurrency
      })
      .then((pics) => {
        let end = new Date().getTime();
        let time = moment.duration(end - start);

        this.mainWindow.webContents.send('finish-import', true);

        console.log(`Finish importing ${pics.length} in ${time.humanize()}`);

        notifier.notify({
          'title': 'Ansel',
          'message': `Finish importing ${pics.length} in ${time.humanize()}`
        });
      });

    notifier.notify({
      'title': 'Ansel',
      'message': 'Start import'
    });
  }

  watch() {
    let self = this;
    let allowed = config.watchedFormats;

    watchr.watch({
      paths: [ self.path, self.versionsPath, config.thumbsPath ],

      listener: (action, filePath) => {
        // on action:create then parse file and update version
        if ((action == 'create' || action == 'update') && filePath.match(allowed)) {

          Version.updateImage(filePath.match(allowed)).then(function(version) {
            console.log('version done', version);

            if (version)
              self.mainWindow.webContents.send('new-version', version);
          });
        }
      }
    });
  }
}

export default Library;
