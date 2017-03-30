import anselBookshelf from './ansel-bookshelf';
import fs from 'fs.extra';
import Promise from 'bluebird';
import sharp from 'sharp';
import libraw from 'libraw';

import config from './../config';

import Photo from './photo';

const copy = Promise.promisify(fs.copy);

const Version = anselBookshelf.Model.extend({
  tableName: 'versions',

  photo: function() {
    this.belongsTo(Photo);
  },

  initialize: function() {
    this.on('creating', model => new Photo({ id: model.get('photo_id') })
      .fetch()
      .then(photo => {
        photo = photo.toJSON();

        let fileName = [
          photo.title,
          photo.id,
          model.get('version')
        ].join('-');

        if (model.get('type') === 'RAW') {
          let fileNamePath = `${config.tmp}/${fileName}.${photo.extension}`;

          model.set('master', fileNamePath);

          return copy(photo.master, fileNamePath);
        }

        let fileNamePath = `${config.tmp}/${fileName}`;

        model.set('master', `${fileNamePath}.tiff`);

        return libraw.extract(photo.master, fileNamePath)
          .then(output => {
            model.set('master', output);
            return output;
          });
      })
      .catch(err => {
        console.error('ERR', err);
      }));
  }
}, {
  updateImage: data => {
    let filename = [ data[1], data[2], data[3] ].join('-');
    let thumbPathName = `${config.thumbs250Path}/${filename}.jpg`;

    return sharp(data.input)
      .resize(250, 250)
      .max()
      .quality(100)
      .toFile(thumbPathName)
      .then(() => Version.where({ photo_id: data[2], version: data[3] })
          .fetch()
      )
      .then(version => {
        if (version) {
          return version.save(
            { output: data.input, thumbnail: thumbPathName },
            { method: 'update' }
          );
        }

        throw 'not-found';
      })
      .catch(err => {
        console.error(err);
        return null;
      });
  }
});

export default Version;
