import alt from './../alt';

import PhotoActions from './../actions/photo-actions';

class PhotoStore {

  constructor() {
    this.bindActions(PhotoActions);
    this.photos = [];
  }

  onGetPhotosSuccess(data) {
    this.photos = data.toJSON();
  }

  onGetDatesSuccess(data) {
    this.dates = data;
  }

  onSetDateFilterSuccess(photos) {
    this.photos = photos.toJSON();
  }

  //onClearDateFilterSuccess(photos) {
  //}

}

export default alt.createStore(PhotoStore);
