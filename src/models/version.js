import anselBookshelf from './ansel-bookshelf';
import fs from 'fs.extra';
import Promise from 'bluebird';
import sharp from 'sharp';
import libraw from 'libraw';

import config from './../config';

import Photo from './photo';

var copy = Promise.promisify(fs.copy);

var Version = anselBookshelf.Model.extend({
  tableName: 'versions',

  photo: function() {
    this.belongsTo(Photo);
  },

  initialize: function() {
    this.on('creating', function(model) {
      console.log('ON CREATING', model.get('photo_id'));

      return new Photo({ id: model.get('photo_id') }).fetch().then(function(photo) {
        photo = photo.toJSON();

        let fileName = [
          photo.title,
          photo.id,
          model.get('version')
        ].join('-');

        if (model.get('type') == 'RAW') {
          let fileNamePath = `${config.tmp}/${fileName}.${photo.extension}`;
          model.set('master', fileNamePath);

          return copy(photo.master, fileNamePath);

        } else {
          console.log('standard', fileNamePath);
          let fileNamePath = `${config.tmp}/${fileName}`;
          model.set('master', `${fileNamePath}.tiff`);

          return libraw.extract(photo.master, fileNamePath)
            .then((output) => {
              console.log('extracted tiff', output);
              model.set('master', output);
              return output;
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
    let thumbPathName = `${config.thumbs250Path}/${filename}.jpg`;

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
