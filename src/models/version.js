import anselBookshelf from './ansel-bookshelf';
import fs from 'fs.extra';
import Promise from 'bluebird';

import Photo from './photo';

//var dbFile = path.join(__dirname, '../../db.sqlite3');

//var knex = require('knex')({
//  client: 'sqlite3',
//  connection: {
//    filename: dbFile
//  }
//});

//var bookshelf = require('bookshelf')(knex);

var Version = anselBookshelf.Model.extend({
  tableName: 'versions',

  initialize: function() {
    this.on('saving', function(model) {
      new Photo({ id: model.get('photo_id') }).fetch().then(function(photo) {
        console.log('photo', photo, photo.toJSON());
        console.log('version model', model.get('original'));
      });
    });
  }
});

export default Version;
