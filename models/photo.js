var knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: "./db.sqlite"
  }
});

var bookshelf = require('bookshelf')(knex);

var Photo = bookshelf.Model.extend({
  tableName: 'photos'
});

module.exports = Photo;
