import anselBookshelf from './ansel-bookshelf';
import shortid from 'shortid';

import Version from './version';
import Tag from './tag';

//shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$#');
shortid.characters('0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZéè');

var Photo = anselBookshelf.Model.extend({
  tableName: 'photos',

  versions: function() {
    return this.hasMany(Version);
  },

  tags: function() {
    return this.belongsToMany(Tag);
  },

  initialize: function() {
    this.on('creating', (model) => {
      console.log('creating');
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
