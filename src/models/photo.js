import path from 'path';

var dbFile = path.join(__dirname, '../../db.sqlite3');

var knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: dbFile
  }
});

var bookshelf = require('bookshelf')(knex);

var Photo = bookshelf.Model.extend({
  tableName: 'photos'
}, {
  getDates: function() {
    return this.query().distinct('date').orderBy('date', 'desc');
  },
  getByDate: function(date) {
    return this.query().where({ date: date });
  }
});

export default Photo;
