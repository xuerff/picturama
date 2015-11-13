import {spawn} from 'child-process-promise';
import anselBookshelf from './ansel-bookshelf';
import fs from 'fs.extra';
import Promise from 'bluebird';
import sharp from 'sharp';

import Photo from './photo';

var copy = Promise.promisify(fs.copy);
var readFile = Promise.promisify(fs.readFile);

var versionPath = process.env.OLDPWD + '/versions/';
var photosPath = process.env.OLDPWD  + '/photos/';
var thumbs250Path = process.env.OLDPWD + '/thumbs-250/';

var Version = anselBookshelf.Model.extend({
  tableName: 'versions',

  photo: function() {
    this.belongsTo(Photo);
  },

  initialize: function() {
    this.on('creating', function(model) {
      console.log('ON CREATING');

      return new Photo({ id: model.get('photo_id') }).fetch().then(function(photo) {
        photo = photo.toJSON();

        let fileName = [
          photo.title,
          photo.id,
          model.get('version')
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
    let filename = [data[1], data[2], data[3]].join('-');
    console.log('fileName', filename);
    let thumbPathName = thumbs250Path + filename + '.jpg';

    console.log('before sharp', thumbPathName);

    return sharp(data.input)
      .resize(250, 250)
      .max()
      .quality(100)
      .toFile(thumbPathName)
      .then(() => {
        console.log('after sharp');
        return Version.where({ photo_id: data[2], version: data[3] })
          .fetch();
      })
      .then((version) => {
        console.log('update img', { photo_id: data[2], version: data[3] }, version);

        if (version)
          return version.save(
            { output: data.input, thumbnail: thumbPathName }, 
            { method: 'update' }
          );
        else
          throw 'not-found';
      })
      .catch(function(err) {
        console.log('err', err);
        return null;
      });
  }
});

export default Version;
