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

  onAddDeviceSuccess(device) {
    let deviceExists = false;

    this.devices.forEach((storedDevice) => {
      if (storedDevice.name == device.name)
        deviceExists = true;
    });

    if (!deviceExists)
      this.devices.push(device);
  }

  onRemoveDeviceSuccess(device) {
    this.devices = this.devices.filter((storedDevice) => {
      return (storedDevice.id != device.id);
    });
  }
}

export default alt.createStore(DeviceStore);
