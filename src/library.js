import { ipcMain } from 'electron';
import moment from 'moment';
import notifier from 'node-notifier';
import fs from 'fs';
import Promise from 'bluebird';
import exiv2 from 'exiv2';

import Scanner from './scanner';
import config from './config';
import metadata from './metadata';

import walker from './lib/walker';
//import matches from './lib/matches';

//import Photo from './models/photo';
import Tag from './models/tag';

const exGetImgTags = Promise.promisify(exiv2.getImageTags);
//const allowed = new RegExp(config.acceptedRawFormats.join('$|') + '$', 'i');
//const allowedImg = new RegExp(config.acceptedImgFormats.join('$|') + '$', 'i');

//const extract = new RegExp(
//  '([^\/]+)\.(' + config.acceptedRawFormats.join('|') + ')$',
//  'i'
//);

//const extractImg = new RegExp(
//  '([^\/]+)\.(' + config.acceptedImgFormats.join('|') + ')$',
//  'i'
//);

class Library {

  constructor(mainWindow) {
    this.mainWindow = mainWindow;

    this.scanForTags = this.scanForTags.bind(this);

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

    ipcMain.on('start-scanning', () => {
      this.scan();
    });
  }

  //prepare(filePaths) {
  //  let rawFiles = filePaths.map((filePath) => {
  //    if (filePath.match(allowed))
  //      return filePath;
  //  })
  //  .filter((filePath) => (filePath));

  //  let imgFiles = filePaths.map((filePath) => {
  //    if (filePath.match(allowedImg))
  //      return filePath;
  //  })
  //  .filter((filePath) => (filePath));

  //  let preparedFiles = rawFiles.map((rawFile) => {
  //    let filename = rawFile.match(extract)[1];
  //    let imgPos = matches(imgFiles, filename);

  //    let element = {
  //      path: rawFile,
  //      name: filename,
  //      isRaw: true
  //    };

  //    if (imgPos != -1) {
  //      element.imgPath = imgFiles[imgPos];

  //      imgFiles = imgFiles.filter((imgFile) => {
  //        return (imgFile != imgFiles[imgPos]);
  //      });
  //    }

  //    return element;
  //  });

  //  imgFiles.forEach((imgFile) => {
  //    let filename = imgFile.match(extractImg)[1];

  //    preparedFiles.push({
  //      path: imgFile,
  //      name: filename,
  //      isRaw: false
  //    });
  //  });

  //  return preparedFiles;
  //}

  //filterStoredPhoto(file) {
  //  return new Photo({ master: file.path })
  //    .fetch()
  //    .then((photo) => !photo);
  //}

  walk(file) {
    if (file.isRaw)
      return this.importRaw(file);
    else
      return this.importImg(file);
  }

  walkForTags(file) {
    return exGetImgTags(file.path)
      .then(metadata.process)
      .then((data) => {
        if (data.tags.length > 0)
          return data.tags;
        else
          throw('no-tag');
      })
      .each((tagName) => {
        return new Tag({ title: tagName })
          .fetch()
          .then((tag) => {
            if (tag)
              return tag;
            else
              return new Tag({ title: tagName }).save();
          });
      })
      .catch(() => {
        return false;
      });
  }

  //importRaw(file) {
  //  let waitFor;

  //  if (file.hasOwnProperty('imgPath'))
  //    waitFor = Promise.resolve(file.imgPath);
  //  else
  //    waitFor = libraw.extractThumb(
  //      `${file.path}`,
  //      `${config.tmp}/${file.name}`
  //    );

  //  return waitFor
  //    .then((imgPath) => {
  //      return readFile(imgPath);
  //    })
  //    .then((img) => {
  //      return sharp(img)
  //        .rotate()
  //        .withMetadata()
  //        .toFile(`${config.thumbsPath}/${file.name}.thumb.jpg`);
  //    })
  //    .then(() => {
  //      return sharp(`${config.thumbsPath}/${file.name}.thumb.jpg`)
  //        .resize(250, 250)
  //        .max()
  //        .quality(100)
  //        .toFile(`${config.thumbs250Path}/${file.name}.jpg`);
  //    })
  //    .then(() => {
  //      return exGetImgTags(file.path).then(metadata.process);
  //    })
  //    .then((xmp) => {
  //      let createdAt = moment(xmp.createdAt, 'YYYY:MM:DD HH:mm:ss');

  //      return new Photo({ title: file.name }).fetch().then((photo) => {
  //        if (photo)
  //          return;
  //        else
  //          return Photo.forge({
  //            title: file.name,
  //            extension: file.path.match(/\.(.+)$/i)[1],
  //            orientation: xmp.orientation,
  //            date: createdAt.format('YYYY-MM-DD'),
  //            created_at: createdAt.toDate(),
  //            exposure_time: xmp.exposureTime,
  //            iso: xmp.iso,
  //            aperture: xmp.fNumber,
  //            focal_length: xmp.focalLength,
  //            master: `${file.path}`,
  //            thumb_250: `${config.thumbs250Path}/${file.name}.jpg`,
  //            thumb: `${config.thumbsPath}/${file.name}.thumb.jpg`
  //          })
  //          .save();
  //      })
  //      .then(photo => this.populateTags(photo, xmp.tags));
  //    })
  //    .then(this.onImportedStep.bind(this))
  //    .catch((err) => {
  //      console.log('ERR knex', file, err);
  //    });
  //}

  //importImg(file) {
  //  return Promise.join(
  //    sharp(file.path)
  //      .resize(250, 250)
  //      .max()
  //      .quality(100)
  //      .toFile(`${config.thumbs250Path}/${file.name}.jpg`),
  //    exGetImgTags(file.path).then(metadata.process),
  //    (img, xmp) => {
  //      let createdAt;

  //      if (xmp.hasOwnProperty('createdAt'))
  //        createdAt = moment(xmp.createdAt, 'YYYY:MM:DD HH:mm:ss');
  //      else {
  //        let fileDate = fs.statSync(file.path);
  //        createdAt = moment(fileDate.birthtime);
  //      }

  //      return new Photo({ title: file.name }).fetch().then((photo) => {
  //        if (photo)
  //          return;
  //        else
  //          return Photo.forge({
  //            title: file.name,
  //            extension: file.path.match(/\.(.+)$/i)[1],
  //            orientation: xmp.orientation,
  //            date: createdAt.format('YYYY-MM-DD'),
  //            created_at: createdAt.toDate(),
  //            exposure_time: xmp.exposureTime,
  //            iso: xmp.iso,
  //            aperture: xmp.fNumber,
  //            focal_length: xmp.focalLength,
  //            master: file.path,
  //            thumb_250: `${config.thumbs250Path}/${file.name}.jpg`,
  //            thumb: file.path
  //          })
  //          .save();
  //      })
  //      .then(photo => this.populateTags(photo, xmp.tags));
  //    }
  //  )
  //  .then(this.onImportedStep.bind(this))
  //  .catch((err) => {
  //    console.log('err', err);
  //    return false;
  //  });
  //}

  //populateTags(photo, tags) {
  //  if (tags.length > 0)
  //    return Promise.each(tags, (tagName) => {
  //      return new Tag({ title: tagName })
  //        .fetch()
  //        .then((tag) => {
  //          if (tag)
  //            return tag;
  //          else
  //            return new Tag({ title: tagName }).save();
  //        })
  //        .then(tag => tag.photos().attach(photo));
  //    })
  //    .then(() => photo);

  //  else return photo;
  //}

  //onImportedStep() {
  //  this.progress.processed++;
  //  this.mainWindow.webContents.send('progress', this.progress);
  //  return true;
  //}

  //setTotal(files) {
  //  this.progress.total = files.length;
  //  return files;
  //}

  scan() {
    var start = new Date().getTime();
    this.mainWindow.webContents.send('start-import', true);

    if (!this.path || !this.versionsPath)
      return false;

    new Scanner(this.path, this.versionsPath, this.mainWindow)
      .scanPictures()
    //walker(this.path, [ this.versionsPath ])
    //  .then(this.prepare.bind(this))
    //  .filter(this.filterStoredPhoto.bind(this))
    //  .then(this.setTotal.bind(this))
    //  .map(this.walk.bind(this), {
    //    concurrency: config.concurrency
    //  })
      .then((pics) => {
        let end = new Date().getTime();
        let time = moment.duration(end - start);

        this.mainWindow.webContents.send('finish-import', true);

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

  scanForTags() {
    var start = new Date().getTime();
    this.mainWindow.webContents.send('start-import', true);

    if (!this.path || !this.versionsPath)
      return false;

    walker(this.path, [ this.versionsPath ])
      .then(this.prepare.bind(this))
      .then(this.setTotal.bind(this))
      .map(this.walkForTags.bind(this), {
        concurrency: config.concurrency
      })
      .then((pics) => {
        let end = new Date().getTime();
        let time = moment.duration(end - start);

        this.mainWindow.webContents.send('finish-import', true);

        notifier.notify({
          'title': 'Ansel',
          'message': `Finish importing tags ${pics.length} in ${time.humanize()}`
        });
      });

    notifier.notify({
      'title': 'Ansel',
      'message': 'Start import'
    });
  }
}

export default Library;
