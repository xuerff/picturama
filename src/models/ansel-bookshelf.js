import config from './../config';

var knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: config.dbFile
  }
});

export default require('bookshelf')(knex);
