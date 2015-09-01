import {spawn} from 'child-process-promise';
import anselBookshelf from './ansel-bookshelf';
import fs from 'fs.extra';
import Promise from 'bluebird';
import sharp from 'sharp';

import Photo from './photo';

var copy = Promise.promisify(fs.copy);
var readFile = Promise.promisify(fs.readFile);

var versionPath = process.env.PWD + '/versions/';
var photosPath = process.env.PWD  + '/photos/';

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

        if (model.get('type') == 'RAW') {
          let fileNamePath = versionPath + fileName + '.' + photo.extension;
          model.set('master', fileNamePath);

          return copy(photo.master, fileNamePath);
        } else {
          let fileNamePath = versionPath + fileName + '.png';
          model.set('master', fileNamePath);

          return spawn('dcraw', [ '-q', '0', photo.master ])
            .then(function() {
              return readFile(photosPath + photo.title + '.ppm');
            })
            .then(function(ppm) {
              console.log('ppm #2');
              return sharp(ppm)
                .toFormat('png')
                .compressionLevel(0)
                .toFile(fileNamePath);
            })
            .catch(function(err) {
              console.log('ERR', err);
            });
        }
      })
      .catch(function(err) {
        console.log('ERR', err);
      });
    });
  }
}, {
  updateImage: function(data) {
    console.log('data', data);
    return this.forge({ photo_id: data[2] }).save({ output: data.input })
    //return this.query().where({ photo_id: data[2] }).then(function(versions) {
    //  if (versions.length > 0) {
    //    let version = versions[0];
    //    version.output = data.input;
    //  }
    //})
    .catch(function(err) {
      console.log('err', err);
    });
  }
});

export default Version;
