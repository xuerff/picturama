//import fs from 'fs';

import config from './../config';

var knex = require('knex')(config.knex);

export default require('bookshelf')(knex);
