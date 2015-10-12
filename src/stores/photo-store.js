import alt from './../alt';

import PhotoActions from './../actions/photo-actions';

class PhotoStore {

  constructor() {
    this.bindActions(PhotoActions);
    this.photos = [];
    this.dates = [];
    this.importing = false;
  }

  onGetPhotosSuccess(data) {
    let photos = data.toJSON();

    this.importing = false;
    this.photos = photos.map(function(photo) {
      photo.versionNumber = 1;

      if (photo.hasOwnProperty('versions') && photo.versions.length > 0) {
        photo.versionNumber = 1 + photo.versions.length;

        let lastVersion = photo.versions.pop();

        photo.thumb = lastVersion.output;
        photo.thumb_250 = lastVersion.thumbnail;
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

    if (updatedPhoto.hasOwnProperty('versions') && updatedPhoto.versions.length > 0) {
      var versionNumber = updatedPhoto.versions.length;
      lastVersion = updatedPhoto.versions.pop();
    }

    this.photos = this.photos.map(function(photo) {
      photo.versionNumber = 1;

      if (photo.id == updatedPhoto.id) {
        photo = updatedPhoto;

        if (lastVersion) {
          photo.thumb = lastVersion.output;
          photo.thumb_250 = lastVersion.thumbnail;
          photo.versionNumber += versionNumber;
        }

        //console.log('versions', photo.versions.length, photo.versions);
        //console.log('updating photo', photo);
      }

      return photo;
    });
  }

  onSetImport(value) {
    this.importing = true;
  }
}

export default alt.createStore(PhotoStore);
