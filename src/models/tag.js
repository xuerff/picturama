import slug from '../lib/slug';

import anselBookshelf from './ansel-bookshelf';

import Photo from './photo';

var Tag = anselBookshelf.Model.extend({
  tableName: 'tags',

  photos: function() {
    return this.belongsToMany(Photo);
  },

  initialize: function() {
    this.on('creating', (model) => {
      let sluggedTitle = slug(model.get('title'));
      model.set('slug', sluggedTitle);
    });
  }

});

export default Tag;
