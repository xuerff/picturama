import fs from 'fs';

import config from './../config';

var knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: config.dbFile
  }
});

if (!fs.existsSync(config.dbFile))
  knex.migrate.latest();

export default require('bookshelf')(knex);
