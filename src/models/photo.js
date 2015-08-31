import path from 'path';
import shortid from 'shortid';

var dbFile = path.join(__dirname, '../../db.sqlite3');

var knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: dbFile
  }
});

var bookshelf = require('bookshelf')(knex);

var Photo = bookshelf.Model.extend({
  tableName: 'photos',

  initialize: function() {
    this.on('saving', (model) => {
      model.set('id', shortid.generate());
    });
  }

}, {
  getDates: function() {
    return this.query().distinct('date').orderBy('date', 'desc');
  },

  getByDate: function(date) {
    return this.query().where({ date: date });
  }
});

export default Photo;
