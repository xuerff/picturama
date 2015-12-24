import alt from './../alt';

class DeviceActions {
  constructor() {
    this.generateActions(
      'initDevicesSuccess',
      'addDeviceSuccess'
    );
  }

  initDevices(devices) {
    this.actions.initDevicesSuccess(devices);
  }

  addDevice(device) {
    this.actions.addDeviceSuccess(device);
  }
}

export default alt.createActions(DeviceActions);
