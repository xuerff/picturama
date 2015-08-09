var fs = require('fs');
var Walk = require('walk');

var acceptedRawFormats = [ 'RAF', 'CR2' ];

var Library = function() {
  console.log('CONSTRUCT');
  this.path = __dirname + '/photos/';
  this.thumbsPath = __dirname + '/thumbs/';
};

Library.prototype.walk = function(root, fileStat, next) {
  var allowed = new RegExp(acceptedRawFormats.join("|") + '$', "i");

  if (fileStat.name.match(allowed))
    console.log(fileStat);

  next();
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
