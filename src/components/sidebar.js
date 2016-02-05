import React from 'react';

import DeviceStore from './../stores/device-store';

import PhotoActions from './../actions/photo-actions';

import Tags from './tags';
import Dates from './dates';

class Sidebar extends React.Component {

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

  clearFilters() {
    let state = this.state;

    PhotoActions.clearDate();
    //this.state.currentDate = null;
    this.setState(state);

    PhotoActions.getPhotos();
  }

  //handleDate(date) {
  //  let state = this.state;

  //  state.currentDate = date;
  //  PhotoActions.setDateFilter(date);
  //  this.setState(state);
  //}

  filterFlagged() {
    PhotoActions.getFlagged();
  }

  isActive(date) {
    return (date.date == this.state.currentDate) ? 'active' : '';
  }

  render() {
    var devicesList = this.state.devices.map((device) => {
      return (
        <li>{device.name}</li>
      );
    });

    return (
      <div id="sidebar">
        <h2><i className="fa fa-camera-retro"></i> Library</h2>

        <div className="sidebar-content">
          <button 
            onClick={this.clearFilters.bind(this)} 
            className="button">
            <i className="fa fa-book"></i> All content
          </button>

          <button
            onClick={this.filterFlagged.bind(this)}
            className="button flagged">
            <i className="fa fa-flag"></i> Flagged
          </button>

          <Dates />

          <Tags />

          <div className="devices">
            <h3><i className="fa fa-usb"></i> Devices</h3>
            <ul>{devicesList}</ul>
          </div>
        </div>
      </div>
    );
  }
}

export default Sidebar;
