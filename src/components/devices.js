import React from 'react';

import DeviceStore from './../stores/device-store';

class Devices extends React.Component {

  constructor(props) {
    super(props);

    this.state = { devices: [] };
  }

  componentDidMount() {
    DeviceStore.listen(this.appendDevices.bind(this));
  }

  appendDevices(data) {
    let state = this.state;
    state.devices = data.devices;
    this.setState(state);
  }

  render() {
    var devicesList = this.state.devices.map((device) => {
      return (
        <li>{device.name}</li>
      );
    });

    return (
      <div className="devices">
        <h3><i className="fa fa-usb"></i> Devices</h3>
        <ul>{devicesList}</ul>
      </div>
    );
  }

}

export default Devices;
