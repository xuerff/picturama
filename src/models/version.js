import anselBookshelf from './ansel-bookshelf';
import fs from 'fs.extra';
import Promise from 'bluebird';

import Photo from './photo';

var copy = Promise.promisify(fs.copy);

var versionPath = process.env.PWD + '/versions/';

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

        return copy(photo.master, fileNamePath);
      })
      .catch(function(err) {
        console.log('ERR', err);
      });
    });
  }
});

export default Version;
