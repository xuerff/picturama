import {spawn} from 'child-process-promise';
import Promise from 'bluebird';
import fs from 'fs';
import Walk from 'walk';
import {ExifImage} from 'exif';
import moment from 'moment';
import watchr from 'watchr';
import sharp from 'sharp';
import notifier from 'node-notifier';

import Photo from './models/photo';
import Version from './models/version';

var acceptedRawFormats = [ 'RAF', 'CR2' ];
var acceptedImgFormats = [ 'JPG', 'JPEG', 'PNG' ];

class Library {

  constructor(mainWindow, path) {
    console.log('PATH', path);
    this.mainWindow = mainWindow;

    this.path = path + '/photos';
    this.versionsPath = path + '/versions/';
    this.thumbsPath = path + '/thumbs/';
    this.thumbs250Path = path + '/thumbs-250/';
  }

  walk(root, fileStat, next) {
    let allowed = new RegExp(acceptedRawFormats.join("$|") + '$', "i");
    let extract = new RegExp('(.+)\.(' + acceptedRawFormats.join("|") + ')$', "i");

    console.log('walk', fileStat.name, this.thumbsPath);

    if (fileStat.name.match(allowed)) {
      let filename = fileStat.name.match(extract)[1];

      return spawn('dcraw', [ '-e', root + '/' + fileStat.name ]).then((data) => {
        new ExifImage({ image: root + '/' + filename + '.thumb.jpg' }, (err, exifData) => {
          var createdAt = moment(exifData.image.ModifyDate, 'YYYY:MM:DD HH:mm:ss');

          sharp(root + '/' + filename + '.thumb.jpg')
            .rotate()
            .toFile(this.thumbsPath + filename + '.thumb.jpg')
            .then((image) => {
              return sharp(this.thumbsPath + filename + '.thumb.jpg')
                .resize(250, 250)
                .max()
                .quality(100)
                .toFile(this.thumbs250Path + filename + '.jpg');
            })
            .then((image) => {
              return new Photo({ title: filename, created_at: createdAt.toDate() }).fetch();
            })
            .then((photo) => {
              if (photo)
                throw 'alredy-existing';
              else
                return Photo.forge({
                  title: filename,
                  extension: fileStat.name.match(/\.(.+)$/i)[1],
                  orientation: exifData.image.Orientation,
                  date: createdAt.format('YYYY-MM-DD'),
                  created_at: createdAt.toDate(),
                  exposure_time: exifData.exif.ExposureTime,
                  iso: exifData.exif.ISO,
                  aperture: exifData.exif.FNumber,
                  focal_length: exifData.exif.FocalLength,
                  master: root + '/' + fileStat.name,
                  thumb_250: this.thumbs250Path + filename + '.jpg',
                  thumb: this.thumbsPath + filename + '.thumb.jpg'
                }).save();
            })
            .then((photo) => {
              next();
            })
            .catch(function(err) {
              console.log('ERR', err);
              next();
            });
        });
      }).catch(function(err) {
        console.log('ERR', err);
        next();
      });

    } else next();
  }

  scan() {
    //var self = this;
    let walker = Walk.walk(this.path, { followLinks: false });

    this.mainWindow.webContents.send('start-import', true);

    notifier.notify({
      'title': 'Ansel',
      'message': 'Start import'
    });

    console.log('Start walk', this.path);

    walker.on("file", this.walk.bind(this));

    walker.on("errors", (root, nodeStatsArray, next) => {
    }); // plural

    walker.on("end", () => {
      this.mainWindow.webContents.send('finish-import', true);

      notifier.notify({
        'title': 'Ansel',
        'message': 'Finish import'
      });
    });
  }

  watch() {
    let self = this;
    let allowed = /([\$\#\w\d]+)-([\$\#\w\d]+)-(\d+)\.(JPEG|JPG|PNG|PPM)/i;

    watchr.watch({
      paths: [ self.path, self.versionsPath, self.thumbsPath ],

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
