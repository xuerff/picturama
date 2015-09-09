import alt from './../alt';
import ipc from 'ipc';

import Photo from './../models/photo';

class PhotoActions {

  constructor() {
    this.generateActions(
      'getPhotosSuccess',
      'getDatesSuccess',
      'setDateFilterSuccess'
    );

    ipc.on('new-version', this.updatePhoto.bind(this));
  }

  updatePhoto(version) {
    console.log('photo actions new version', version);
  }

  getPhotos() {
    new Photo()
      .fetchAll({ withRelated: ['versions'] })
      .then((photos) => {
        this.actions.getPhotosSuccess(photos);
      });
  }

  getDates() {
    Photo.getDates().then((dates) => {
      this.actions.getDatesSuccess(dates);
    });
  }

  setDateFilter(date) {
    new Photo()
      .where({ date: date })
      .fetchAll()
      .then((photos) => {
        this.actions.setDateFilterSuccess(photos);
      });
  }

}

export default alt.createActions(PhotoActions);
