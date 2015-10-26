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
  },

  toggleFlag: function(photo) {
    console.log('toggle falg', photo);

    return Photo
      .where({ id: photo.id })
      .fetch()
      .then(function(photoModel) {
        let flag = (photo.flag === 0) ? 1 : 0;
        console.log('save photo', photoModel, flag);

        return photoModel.save({ 'title': 'trololo' }, { method: 'update' });
        //return photoModel.save({ 'flag': 1 });
      });
  }
});

export default Photo;
