import Walk from 'walk';
import {ExifImage} from 'exif';
import moment from 'moment';
import watchr from 'watchr';
import sharp from 'sharp';
import notifier from 'node-notifier';
import fs from 'fs';
import Promise from 'bluebird';
import libraw from 'node-libraw';

import config from './config';

import Photo from './models/photo';
import Version from './models/version';

var readFile = Promise.promisify(fs.readFile);

class Library {

  constructor(mainWindow, path) {
    this.mainWindow = mainWindow;

    this.path = `${path}/photos`;
    this.versionsPath = `${path}/versions/`;

    if (!fs.existsSync(config.tmp))
      fs.mkdirSync(config.tmp);
  }

  walk(root, fileStat, next) {
    let allowed = new RegExp(config.acceptedRawFormats.join('$|') + '$', 'i');
    let extract = new RegExp('(.+)\.(' + config.acceptedRawFormats.join('|') + ')$', 'i');

    if (fileStat.name.toLowerCase().match(allowed)) {

      console.log('walk', fileStat.name, config.thumbsPath);
      let filename = fileStat.name.match(extract)[1];

      let imgPath = libraw.extractThumb(
        `${root}/${fileStat.name}`,
        `${config.tmp}/${filename}`
      );

      readFile(imgPath)
        .then((img) => {
          return sharp(img)
            .rotate()
            .withMetadata()
            .toFile(`${config.thumbsPath}/${filename}.thumb.jpg`);
        })
        .then(() => {
          return sharp(`${config.thumbsPath}/${filename}.thumb.jpg`)
            .resize(250, 250)
            .max()
            .quality(100)
            .toFile(`${config.thumbs250Path}/${filename}.jpg`);
        })
        .then(() => {
          return new Photo({ title: filename }).fetch();
        })
        .then((photo) => {
          new ExifImage({ image: `${config.thumbsPath}/${filename}.thumb.jpg` }, (err, exifData) => {

            //if (filename == 'IMG_20151212_220358')
            //  console.log('exif', err, exifData);

            let createdAt = moment(
              exifData.image.ModifyDate,
              'YYYY:MM:DD HH:mm:ss'
            );

            let orientation = 1;

            if (exifData.image.hasOwnProperty('Orientation'))
              orientation = exifData.image.Orientation;

            if (photo)
              next();
            else
              return Photo.forge({
                title: filename,
                extension: fileStat.name.match(/\.(.+)$/i)[1],
                orientation,
                date: createdAt.format('YYYY-MM-DD'),
                created_at: createdAt.toDate(),
                exposure_time: exifData.exif.ExposureTime,
                iso: exifData.exif.ISO,
                aperture: exifData.exif.FNumber,
                focal_length: exifData.exif.FocalLength,
                master: `${root}/${fileStat.name}`,
                thumb_250: `${config.thumbs250Path}/${filename}.jpg`,
                thumb: `${config.thumbsPath}/${filename}.thumb.jpg`
              })
              .save()
              .then(() => {
                console.log('saved');
                next();
              })
              .catch((err) => {
                console.log('err on save', err);
              });
          });
        })
        .catch(function(err) {
          console.log('ERR', err);
          next();
        });
      //}).catch(function(err) {
      //  console.log('ERR', err);
      //  next();
      //});

    } else next();
  }

  scan() {
    let walker = Walk.walk(this.path, { followLinks: false });

    this.mainWindow.webContents.send('start-import', true);

    notifier.notify({
      'title': 'Ansel',
      'message': 'Start import'
    });

    console.log('Start walk', this.path);

    walker.on('file', this.walk.bind(this));

    walker.on('end', () => {
      this.mainWindow.webContents.send('finish-import', true);

      notifier.notify({
        'title': 'Ansel',
        'message': 'Finish import'
      });
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
          console.log('listen now', action, filePath);

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
