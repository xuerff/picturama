import alt from './../alt';

import VersionActions from './../actions/version-actions';

class VersionStore {
  constructor() {
    this.bindActions(VersionActions);
  }
}

export default alt.createStore(VersionStore);
