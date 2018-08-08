import config from '../config'

const knex = require('knex')(config.knex);

export default require('bookshelf')(knex);
