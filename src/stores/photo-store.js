import alt from './../alt';

import PhotoActions from './../actions/photo-actions';

class PhotoStore {

  constructor() {
    this.bindActions(PhotoActions);
    this.photos = [];
    this.dates = [];
  }

  onGetPhotosSuccess(data) {
    let photos = data.toJSON();

    console.log('photos', this.photos);

    this.photos = photos.map(function(photo) {
      if (photo.hasOwnProperty('versions') && photo.versions.length > 0) {
        let lastVersion = photo.versions.pop();
        photo.thumb = lastVersion.output;
      }

      return photo;
    });
  }

  onGetDatesSuccess(data) {
    this.dates = data;
  }

  onSetDateFilterSuccess(photos) {
    this.photos = photos.toJSON();
  }

}

export default alt.createStore(PhotoStore);
