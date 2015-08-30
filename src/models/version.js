import path from 'path';

var dbFile = path.join(__dirname, '../../db.sqlite3');

var knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: dbFile
  }
});

var bookshelf = require('bookshelf')(knex);

var Version = bookshelf.Model.extend({
  tableName: 'versions'
});

export default Version;
