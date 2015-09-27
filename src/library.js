import {spawn} from 'child-process-promise';
import Promise from 'bluebird';
import fs from 'fs';
import Walk from 'walk';
import {ExifImage} from 'exif';
import moment from 'moment';
import watchr from 'watchr';
import sharp from 'sharp';
import exifJs from 'exif-js';

import Photo from './models/photo';
import Version from './models/version';

var acceptedRawFormats = [ 'RAF', 'CR2' ];
var acceptedImgFormats = [ 'JPG', 'JPEG', 'PNG' ];

var path = process.env.PWD + '/photos';
var versionsPath = process.env.PWD + '/versions/';
var thumbsPath = process.env.PWD  + '/thumbs/';
var thumbs250Path = process.env.PWD  + '/thumbs-250/';

class Library {

  constructor(mainWindow) {
    this.mainWindow = mainWindow;
  }

  walk(root, fileStat, next) {
    let allowed = new RegExp(acceptedRawFormats.join("$|") + '$', "i");
    let extract = new RegExp('(.+)\.(' + acceptedRawFormats.join("|") + ')$', "i");

    if (fileStat.name.match(allowed)) {
      let filename = fileStat.name.match(extract)[1];

      return spawn('dcraw', [ '-e', root + '/' + fileStat.name ]).then((data) => {
        new ExifImage({ image: root + '/' + filename + '.thumb.jpg' }, (err, exifData) => {
          var createdAt = moment(exifData.image.ModifyDate, 'YYYY:MM:DD HH:mm:ss')

          sharp(root + '/' + filename + '.thumb.jpg')
            .rotate()
            .toFile(thumbsPath + filename + '.thumb.jpg')
            .then((image) => {
              return sharp(thumbsPath + filename + '.thumb.jpg')
                .resize(250, 250)
                .max()
                .quality(100)
                .toFile(thumbs250Path + filename + '.jpg');
            })
            //.spread((thumb, metadata) => {
            //  return thumb.resize(250, null).max();
            //})
            //.then((thumb) => {
            //  return thumb.toFile(thumbs250Path + filename + '.jpg');
            //})
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
                  thumb_250: thumbs250Path + filename + '.jpg',
                  thumb: thumbsPath + filename + '.thumb.jpg'
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
    var self = this;
    var walker = Walk.walk(path, { followLinks: false });

    self.mainWindow.webContents.send('start-import', true);

    walker.on("file", this.walk);

    walker.on("errors", (root, nodeStatsArray, next) => {
    }); // plural

    walker.on("end", () => {
      self.mainWindow.webContents.send('finish-import', true);
    });
  }

  watch() {
    var self = this;
    var allowed = /([\w\d]+)-([\w\d]+)-(\d+)\.(JPEG|JPG|PNG|PPM)/i

    watchr.watch({
      paths: [ path, versionsPath, thumbsPath ],

      listener: (action, filePath) => {
        console.log('listen now', action, filePath);

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
