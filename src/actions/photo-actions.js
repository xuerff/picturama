import alt from './../alt';

import Photo from './../models/photo';

class PhotoActions {

  constructor() {
    this.generateActions(
      'getPhotosSuccess',
      'getDatesSuccess',
      'setDateFilterSuccess'
      //'clearDateFilterSuccess'
    );
  }

  getPhotos() {
    new Photo().fetchAll().then((photos) => {
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

  //clearDateFilter() {
  //  this.actions.clearDateFilterSuccess([]);
  //}
}

export default alt.createActions(PhotoActions);
