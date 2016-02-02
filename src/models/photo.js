import anselBookshelf from './ansel-bookshelf';
import shortid from 'shortid';

import config from './../config';

import Version from './version';
import Tag from './tag';

shortid.characters(config.characters);

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
      model.set('id', shortid.generate());
    });
  }

}, {
  getDates: function() {
    return this.query().distinct('date').orderBy('date', 'desc');
  }
});

export default Photo;
