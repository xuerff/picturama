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

  onUpdatedPhotoSuccess(photo) {
    let updatedPhoto = photo.toJSON();
    let lastVersion = {};

    console.log('updatedPhoto', updatedPhoto);

    if (updatedPhoto.hasOwnProperty('versions') && updatedPhoto.versions.length > 0)
      lastVersion = updatedPhoto.versions.pop();

    this.photos = this.photos.map(function(photo) {
      if (photo.id == updatedPhoto.id) {
        photo = updatedPhoto;

        console.log('last version', lastVersion);

        if (lastVersion) photo.thumb = lastVersion.output;
        console.log('updating photo', photo);
      }

      return photo;
    });
  }

}

export default alt.createStore(PhotoStore);
