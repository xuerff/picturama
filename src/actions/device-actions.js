import alt from './../alt';

class DeviceActions {
  constructor() {
    this.generateActions(
      'initDevicesSuccess',
      'addDeviceSuccess',
      'removeDeviceSuccess'
    );
  }

  initDevices(devices) {
    this.actions.initDevicesSuccess(devices);
  }

  addDevice(device) {
    this.actions.addDeviceSuccess(device);
  }

  removeDevice(device) {
    this.actions.removeDeviceSuccess(device);
  }
}

export default alt.createActions(DeviceActions);
