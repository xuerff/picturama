import slug from 'slug';

import anselBookshelf from './ansel-bookshelf';

import Photo from './photo';

var Tag = anselBookshelf.Model.extend({
  tableName: 'tags',

  photos: function() {
    return this.belongsToMany(Photo);
  },

  initialize: function() {
    this.on('creating', (model) => {
      console.log('creating', model);
      model.set('slug', slug(model.get('title')));
    });
  }

});

export default Tag;
