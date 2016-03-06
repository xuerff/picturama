import React from 'react';
import { connect } from 'react-redux';

class Devices extends React.Component {
  static propTypes = {
    devices: React.PropTypes.array.isRequired
  }

  constructor(props) {
    super(props);

    this.state = { devices: [] };
  }

  appendDevices(data) {
    let state = this.state;
    state.devices = data.devices;
    this.setState(state);
  }

  render() {
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
