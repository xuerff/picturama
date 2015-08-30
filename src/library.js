import Promise from 'bluebird';
import fs from 'fs';
import Walk from 'walk';
import {ExifImage} from 'exif';
import moment from 'moment';

import Photo from './models/photo';

var acceptedRawFormats = [ 'RAF', 'CR2' ];
var path = __dirname + '/../photos/';
var thumbsPath = __dirname + '/../thumbs/';

var fsRename = Promise.promisify(fs.rename);

class Library {
  walk(root, fileStat, next) {
    let allowed = new RegExp(acceptedRawFormats.join("$|") + '$', "i");
    let extract = new RegExp('(.+)\.(' + acceptedRawFormats.join("|") + ')$', "i");
    let spawn = require('child_process').spawn;

    //console.log('allowed', allowed, fileStat.name.match(allowed));
    if (fileStat.name.match(allowed)) {
      //console.log('file stat', fileStat.name);
      let filename = fileStat.name.match(extract)[1];
      let cmd  = spawn('dcraw', [ '-e', path + fileStat.name ]);

      cmd.stdout.on('data', (data) => {
        console.log('stdout: ' + data);
      });

      cmd.stderr.on('data', (data) => {
        console.log('stderr: ' + data);
      });

      cmd.on('exit', (code) => {
        new ExifImage({ image: path + filename + '.thumb.jpg' }, (err, exifData) => {
          var createdAt = moment(exifData.image.ModifyDate, 'YYYY:MM:DD HH:mm:ss')

          fsRename(path + filename + '.thumb.jpg', thumbsPath + filename + '.thumbs.jpg')
            .then(() => {
              return new Photo({ title: filename, created_at: createdAt.toDate() }).fetch();
            })
            .then((photo) => {
              if (photo)
                throw 'alredy-existing';
              else
                return Photo.forge({
                  title: filename,
                  orientation: exifData.image.Orientation,
                  date: createdAt.format('YYYY-MM-DD'),
                  created_at: createdAt.toDate(),
                  exposure_time: exifData.exif.ExposureTime,
                  iso: exifData.exif.ISO,
                  aperture: exifData.exif.FNumber,
                  focal_length: exifData.exif.FocalLength,
                  master: path + fileStat.name,
                  thumb: thumbsPath + filename + '.thumbs.jpg'
                }).save();
            })
            .then((photo) => {
              next();
            })
            .catch((err) => {
              console.log('err', err);
              next();
            });
        });
      });
    } else next();
  }

  scan() {
    console.log('SCAN', path);
    var walker = Walk.walk(path, { followLinks: false });

    walker.on("file", this.walk);

    walker.on("errors", (root, nodeStatsArray, next) => {
    }); // plural

    walker.on("end", () => {
      console.log('done');
    });
  }
}

export default Library;
