import alt from './../alt';

import Photo from './../models/photo';

class PhotoActions {

  constructor() {
    this.generateActions('getPhotosSuccess');
  }

  getPhotos() {
    new Photo().fetchAll()
    .then((photos) => {
      this.actions.getPhotosSuccess(photos);
    });
  }

}

export default alt.createActions(PhotoActions);
