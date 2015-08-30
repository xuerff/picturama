import path from 'path';
import shortid from 'shortid';

var dbFile = path.join(__dirname, '../../db.sqlite3');

var knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: dbFile
  //},
  //initialize: () => {
  //  console.log('INIT');
  //  this.on('saving', (model) => {
  //    console.log('SAVING');
  //    model.set('id', shortid.generate());
  //  });
  }
});

var bookshelf = require('bookshelf')(knex);

var Photo = bookshelf.Model.extend({
  tableName: 'photos',

  initialize: function() {
    console.log('INIT', this);

    this.on('saving', (model) => {
      console.log('SAVING');
      model.set('id', shortid.generate());
    });
  }

}, {
  getDates: () => {
    return this.query().distinct('date').orderBy('date', 'desc');
  },
  getByDate: (date) => {
    return this.query().where({ date: date });
  }
});

export default Photo;
