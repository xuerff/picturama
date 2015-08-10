var fs = require('fs');
var Walk = require('walk');
var Photo = require('./models/photo');

var acceptedRawFormats = [ 'RAF', 'CR2' ];
var path = __dirname + '/photos/';
var thumbsPath = __dirname + '/thumbs/';

var Library = function() {
  console.log('CONSTRUCT');
  this.path = __dirname + '/photos/';
  this.thumbsPath = __dirname + '/thumbs/';
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
      console.log('exit code: ' + code);
      fs.rename(path + filename + '.thumb.jpg', thumbsPath + filename + '.thumbs.jpg',
        function(err) {
          // TODO: Store photo
          Photo.forge({
            title: filename,
            master: path + filename + '.thumb.jpg',
            thumb: thumbsPath + filename + '.thumbs.jpg'
          }).save().then(function(photo) {
            console.log('new photo', photo);
            next();
          });
        });
    });
  }
};

Library.prototype.scan = function() {
  console.log('SCAN', this.path);
  var walker = Walk.walk(this.path, { followLinks: false });

  walker.on("file", this.walk);

  walker.on("errors", function(root, nodeStatsArray, next) {
  }); // plural

  walker.on("end", function() {
    console.log('done');
  });
};

module.exports = Library;
