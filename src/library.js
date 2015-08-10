var Promise = require('bluebird');
var fs = require("fs");
var Walk = require('walk');
var Photo = require('./models/photo');
var ExifImage = require('exif').ExifImage;

var acceptedRawFormats = [ 'RAF', 'CR2' ];
var path = __dirname + '/../photos/';
var thumbsPath = __dirname + '/../thumbs/';

var fsRename = Promise.promisify(fs.rename);

var Library = function() {
};

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

        fsRename(path + filename + '.thumb.jpg', thumbsPath + filename + '.thumbs.jpg')
          .then(function() {
             return Photo.forge({
              title: filename,
              orientation: orientation,
              master: path + filename + '.thumb.jpg',
              thumb: thumbsPath + filename + '.thumbs.jpg'
            }).save();
          })
          .then(function(photo) {
            console.log('new photo', photo);
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

module.exports = Library;
