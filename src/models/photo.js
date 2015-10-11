import anselBookshelf from './ansel-bookshelf';
import shortid from 'shortid';

import Version from './version';

shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$#');

var Photo = anselBookshelf.Model.extend({
  tableName: 'photos',

  versions: function() {
    return this.hasMany(Version);
  },

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
