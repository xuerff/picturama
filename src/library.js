import Promise from 'bluebird';
import fs from 'fs';
import Walk from 'walk';
import {ExifImage} from 'exif';

import Photo from './models/photo';

var acceptedRawFormats = [ 'RAF', 'CR2' ];
var path = __dirname + '/../photos/';
var thumbsPath = __dirname + '/../thumbs/';

var fsRename = Promise.promisify(fs.rename);

class Library {
  walk(root, fileStat, next) {
    let allowed = new RegExp(acceptedRawFormats.join("|") + '$', "i");
    let extract = new RegExp('(.+)\.(' + acceptedRawFormats.join("|") + ')$', "i");
    let spawn = require('child_process').spawn;

    if (fileStat.name.match(allowed)) {
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
          let orientation = exifData.image.Orientation;
          let createdAt = exifData.image.ModifyDate;

          fsRename(path + filename + '.thumb.jpg', thumbsPath + filename + '.thumbs.jpg')
            .then(() => {
              return new Photo({ title: filename, created_at: createdAt }).fetch();
            })
            .then((photo) => {
              console.log('find photo', photo);
              if (photo)
                throw 'alredy-existing';
              else
                return Photo.forge({
                  title: filename,
                  orientation: orientation,
                  created_at: createdAt,
                  master: path + filename + '.thumb.jpg',
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
    }
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
//var Library = function() {
//};

Library.prototype.walk = function(root, fileStat, next) {
  var allowed = new RegExp(acceptedRawFormats.join("|") + '$', "i");
  var extract = new RegExp('(.+)\.(' + acceptedRawFormats.join("|") + ')$', "i");
  var spawn = require('child_process').spawn;

  if (fileStat.name.match(allowed)) {
    var filename = fileStat.name.match(extract)[1];

    var cmd  = spawn('dcraw', [ '-e', path + fileStat.name ]);

    cmd.stdout.on('data', function(data) {
      console.log('stdout: ' + data);
    });

    cmd.stderr.on('data', function(data) {
      console.log('stderr: ' + data);
    });

    cmd.on('exit', function(code) {
      new ExifImage({ image: path + filename + '.thumb.jpg' }, function(err, exifData) {
        var orientation = exifData.image.Orientation;
        var createdAt = exifData.image.ModifyDate;

        fsRename(path + filename + '.thumb.jpg', thumbsPath + filename + '.thumbs.jpg')
          .then(function() {
            return new Photo({ title: filename, created_at: createdAt }).fetch();
          })
          .then(function(photo) {
            console.log('find photo', photo);
            if (photo)
              throw 'alredy-existing';
            else
              return Photo.forge({
                title: filename,
                orientation: orientation,
                created_at: createdAt,
                master: path + filename + '.thumb.jpg',
                thumb: thumbsPath + filename + '.thumbs.jpg'
              }).save();
          })
          .then(function(photo) {
            next();
          })
          .catch(function(err) {
            console.log('err', err);
            next();
          });
      });
    });
  }
};

Library.prototype.scan = function() {
  console.log('SCAN', path);
  var walker = Walk.walk(path, { followLinks: false });

  walker.on("file", this.walk);

  walker.on("errors", function(root, nodeStatsArray, next) {
  }); // plural

  walker.on("end", function() {
    console.log('done');
  });
};

export default Library;
