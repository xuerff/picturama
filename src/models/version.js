import {spawn} from 'child-process-promise';
import anselBookshelf from './ansel-bookshelf';
import fs from 'fs.extra';
import Promise from 'bluebird';

import Photo from './photo';

var copy = Promise.promisify(fs.copy);

//var acceptedRawFormats = [ 'RAF', 'CR2' ];
var versionPath = process.env.PWD + '/versions/';
var photosPath = process.env.PWD  + '/photos/';
//var extract = new RegExp('(.+)\.(' + acceptedRawFormats.join("|") + ')$', "i");

var Version = anselBookshelf.Model.extend({
  tableName: 'versions',

  initialize: function() {
    this.on('saving', function(model) {
      return new Photo({ id: model.get('photo_id') }).fetch().then(function(photo) {
        photo = photo.toJSON();

        let fileName = [
          photo.title,
          photo.id,
          model.get('version'),
        ].join('-');

        let fileNamePath = versionPath + fileName + '.' + photo.extension;

        model.set('master', fileNamePath);

        if (model.get('type') == 'RAW')
          return copy(photo.master, fileNamePath);
        else {
          return spawn('dcraw', [ '-q', '0', photo.master ]).then(function() {
            return copy(photosPath + photo.title + '.ppm', fileNamePath);
          });
        }
      })
      .catch(function(err) {
        console.log('ERR', err);
      });
    });
  }
});

export default Version;
