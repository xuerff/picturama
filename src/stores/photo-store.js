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

}

export default alt.createStore(PhotoStore);
