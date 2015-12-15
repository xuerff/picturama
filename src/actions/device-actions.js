import alt from './../alt';

class DeviceActions {
  constructor() {
    this.generateActions('initDevicesSuccess');
  }

  initDevices(devices) {
    this.actions.initDevicesSuccess(devices);
  }
}

export default alt.createActions(DeviceActions);
