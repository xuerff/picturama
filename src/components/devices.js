import React from 'react';
import { connect } from 'react-redux';

//import DeviceStore from './../stores/device-store';

class Devices extends React.Component {
  static propTypes = {
    devices: React.PropTypes.array.isRequired
  }

  constructor(props) {
    super(props);

    this.state = { devices: [] };
  }

  //componentDidMount() {
  //  DeviceStore.listen(this.appendDevices.bind(this));
  //}

  appendDevices(data) {
    let state = this.state;
    state.devices = data.devices;
    this.setState(state);
  }

  render() {
    //var devicesList = this.props.devices.map((device) => {
    //  return (
    //    <li>{device.name}</li>
    //  );
    //});

    return (
      <div className="devices">
        <h3><i className="fa fa-usb"></i> Devices</h3>
        <ul>
          {this.props.devices.map((device) => <li>{device.name}</li>)}
        </ul>
      </div>
    );
  }

}

const ReduxDevices = connect(state => ({
  devices: state.devices
}))(Devices);

export default ReduxDevices;
