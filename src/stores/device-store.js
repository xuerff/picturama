import alt from './../alt';

import DeviceActions from './../actions/device-actions';

class DeviceStore {
  constructor() {
    this.bindActions(DeviceActions);
    this.devices = [];
  }

  onInitDevicesSuccess(devices) {
    this.devices = devices;
  }
}

export default alt.createStore(DeviceStore);
