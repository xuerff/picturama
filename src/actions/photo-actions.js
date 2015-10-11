import alt from './../alt';

import Photo from './../models/photo';

class PhotoActions {

  constructor() {
    this.generateActions(
      'getPhotosSuccess',
      'getDatesSuccess',
      'setDateFilterSuccess',
      'updatedPhotoSuccess',
      'setImporting'
    );
  }

  updatedPhoto(version) {
    console.log('photo actions new version', version, this);

    new Photo({ id: version.attributes.photo_id })
      .fetch({ withRelated: ['versions'] })
      .then((photo) => {
        this.actions.updatedPhotoSuccess(photo);
      });
  }

  getPhotos() {
    console.log('get photos');

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
      .fetchAll({ withRelated: ['versions'] })
      .then((photos) => {
        this.actions.getPhotosSuccess(photos);
        //this.actions.setDateFilterSuccess(photos);
      });
  }

  startImport() {
    console.log('start import');
    this.actions.setImporting(true);
  }
}

export default alt.createActions(PhotoActions);
