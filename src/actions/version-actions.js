import alt from './../alt';

import Version from './../models/version';

class VersionActions {

  constructor() {
    this.generateActions(
      'createVersionSuccess',
      'createVersionSuccessOpenWith'
    );
  }

  createVersion(photo) {
    new Version({
      type: 'RAW',
      version: '1',
      photo_id: photo.id
    }).save().then((version) => {
      this.actions.createVersionSuccess(version);
    });
  }

  createVersionAndOpenWith(photo, targetSoftware) {
    new Version({
      type: 'RAW',
      version: '1',
      photo_id: photo.id
    }).save().then((version) => {
      this.actions.createVersionSuccessOpenWith({ version, targetSoftware });
    });
  }

  openWithRawtherapee(version) {
    console.log('action open with rt', version);
  }
}

export default alt.createActions(VersionActions)

