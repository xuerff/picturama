import moment from 'moment';
import watchr from 'watchr';
import sharp from 'sharp';
import notifier from 'node-notifier';
import fs from 'fs';
import Promise from 'bluebird';
import libraw from 'libraw';
import exiv2 from 'exiv2';

import config from './config';
import metadata from './metadata';

//import exifParser from './lib/exif-parser';
import walker from './lib/walker';
import matches from './lib/matches';

import Photo from './models/photo';
//import Tag from './models/tag';
import Version from './models/version';

//console.log('metadata', metadata);

const exGetImgTags = Promise.promisify(exiv2.getImageTags);
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
    this.progress = { processed: 0, total: 0 };

    this.importRaw = this.importRaw.bind(this);
    this.importImg = this.importImg.bind(this);
    //this.populateTags = this.populateTags.bind(this);
    //this.processXMP = this.processXMP.bind(this);

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

  filterStoredPhoto(file) {
    return new Photo({ master: file.path })
      .fetch()
      .then((photo) => !photo);
  }

  walk(file) {
    if (file.isRaw)
      return this.importRaw(file);
    else
      return this.importImg(file);
  }

  importRaw(file) {
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
        return exGetImgTags(file.path).then(metadata.process);
      })
      .then((xmp) => {
        //console.log('RAW Xmp', xmp);

        //let createdAt = moment(
        //  exifData.image.ModifyDate,
        //  'YYYY:MM:DD HH:mm:ss'
        //);

        //let orientation = 1;

        //if (exifData.image.hasOwnProperty('Orientation'))
        //  orientation = exifData.image.Orientation;

        return new Photo({ title: file.name }).fetch().then((photo) => {
          if (photo)
            return;
          else
            return Photo.forge({
              title: file.name,
              extension: file.path.match(/\.(.+)$/i)[1],
              orientation: xmp.orientation,
              date: xmp.createdAt.format('YYYY-MM-DD'),
              created_at: xmp.createdAt.toDate(),
              exposure_time: xmp.exposureTime,
              iso: xmp.iso,
              aperture: xmp.fNumber,
              focal_length: xmp.focalLength,
              master: `${file.path}`,
              thumb_250: `${config.thumbs250Path}/${file.name}.jpg`,
              thumb: `${config.thumbsPath}/${file.name}.thumb.jpg`
            })
            .save();
        });
      })
      .then(this.onImportedStep.bind(this))
      .catch((err) => {
        console.log('ERR', file, err);
      });
  }

  //processXMP(exData) {
  //  let xmp = {
  //    exposureTime: eval(exData['Exif.Image.ExposureTime']),
  //    iso: parseInt(exData['Exif.Image.ISOSpeedRating']),
  //    focalLength: eval(exData['Exif.Image.FocalLength']),
  //    aperture: eval(exData['Exif.Image.FNumber']),
  //    tags: this.populateTags(exData)
  //  };

  //  if (exData.hasOwnProperty('Exif.Image.DateTime'))
  //    xmp.createdAt = moment(
  //      exData['Exif.Image.DateTime'],
  //      'YYYY:MM:DD HH:mm:ss'
  //    );

  //  if (exData.hasOwnProperty('Exif.Image.Orientation'))
  //    xmp.orientation = parseInt(exData['Exif.Image.Orientation']);
  //  else
  //    xmp.orientation = 1;

  //  let id = matches(Object.keys(exData), 'ExposureTime');
  //  console.log('ex data', exData);
  //  console.log(
  //    'exposure time', 
  //    exData[Object.keys(exData)[id]]
  //  );
  //  return xmp;
  //}

  //populateTags(exData) {
  //  if (exData && exData.hasOwnProperty('Xmp.dc.subject'))
  //    return Promise.map(exData['Xmp.dc.subject'].split(', '), (tagName) => {
  //      return new Tag({ title: tagName })
  //        .fetch()
  //        .then((tag) => {
  //          if (tag)
  //            return tag;
  //          else
  //            return new Tag({ title: tagName }).save();
  //        });
  //    });

  //  else return [];
  //}

  importImg(file) {
    return Promise.join(
      sharp(file.path)
        .resize(250, 250)
        .max()
        .quality(100)
        .toFile(`${config.thumbs250Path}/${file.name}.jpg`),
      //sharp(file.path).metadata(),
      exGetImgTags(file.path).then(this.populateTags),
      (img, xmp) => {
        //let createdAt;

        //if (exifData.image.hasOwnProperty('ModifyDate'))
        //  createdAt = moment(
        //    exifData.image.ModifyDate,
        //    'YYYY:MM:DD HH:mm:ss'
        //  );
        //else
        //  createdAt = moment(
        //    fs.statSync(file.path).birthtime
        //  );

        //let orientation = 1;

        //if (exifData.image.hasOwnProperty('Orientation'))
        //  orientation = exifData.image.Orientation;
        //else if (metadata.width < metadata.height)
        //  orientation = 0;

        // TODO: How to determine orientation from a JPG file?

        return new Photo({ title: file.name }).fetch().then((photo) => {
          if (photo)
            return;
          else
            return Photo.forge({
              title: file.name,
              extension: file.path.match(/\.(.+)$/i)[1],
              orientation: xmp.orientation,
              date: xmp.createdAt.format('YYYY-MM-DD'),
              created_at: xmp.createdAt.toDate(),
              exposure_time: xmp.exposureTime,
              iso: xmp.iso,
              aperture: xmp.fNumber,
              focal_length: xmp.focalLength,
              master: file.path,
              thumb_250: `${config.thumbs250Path}/${file.name}.jpg`,
              thumb: file.path
            })
            .save();
        })
        .then((photo) => {
          if (xmp.tags.length > 0)
            return Promise.map(xmp.tags, (tag) => {
              return tag
                .photos()
                .attach(photo);
            })
            .then(() => photo);

          else return photo;
        });
      }
    )
    .then(this.onImportedStep.bind(this))
    .catch((err) => {
      console.log('err', err);
      return false;
    });
  }

  onImportedStep() {
    this.progress.processed++;
    this.mainWindow.webContents.send('progress', this.progress);
    return true;
  }

  setTotal(files) {
    this.progress.total = files.length;
    return files;
  }

  scan() {
    console.log('start scan', this.path, this.versionsPath);
    var start = new Date().getTime();
    this.mainWindow.webContents.send('start-import', true);

    if (!this.path || !this.versionsPath)
      return false;

    walker(this.path, [ this.versionsPath ])
      .then(this.prepare.bind(this))
      .filter(this.filterStoredPhoto.bind(this))
      .then(this.setTotal.bind(this))
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
