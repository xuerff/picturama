import {spawn} from 'child_process';
import alt from './../alt';

import VersionActions from './../actions/version-actions';

class VersionStore {
  constructor() {
    this.bindActions(VersionActions);
    this.version = {};
  }

  onCreateVersionSuccess(data) {
    this.version = data.toJSON();
  }

  onCreateVersionSuccessOpenWith(data) {
    console.log('before open', data.targetSoftware, [ this.version.master ]);
    this.version = data.version.toJSON();

    if (data.targetSoftware && this.version.master)
      spawn(data.targetSoftware, [ this.version.master ]);
  }
}

export default alt.createStore(VersionStore);
