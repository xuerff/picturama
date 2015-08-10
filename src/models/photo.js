var path = require('path');
var dbFile = path.join(__dirname, '../../db.sqlite3');
console.log('db file', dbFile);
var knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: dbFile
  }
});

var bookshelf = require('bookshelf')(knex);

var Photo = bookshelf.Model.extend({
  tableName: 'photos'
});

module.exports = Photo;
