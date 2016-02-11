import React from 'react';
import {ipcRenderer} from 'electron';

import PhotoActions from './../actions/photo-actions';
import DeviceActions from './../actions/device-actions';

import Sidebar from './sidebar';
import Container from './container';

class Ansel extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};

    ipcRenderer.on('new-version', PhotoActions.updatedPhoto);
    ipcRenderer.on('start-import', PhotoActions.startImport);
    ipcRenderer.on('progress', PhotoActions.importProgress);

    ipcRenderer.on('finish-import', () => {
      PhotoActions.getPhotos();
      PhotoActions.getDates();
    });

    ipcRenderer.on('scanned-devices', (e, devices) => {
      console.log('scanned devices', devices);
      DeviceActions.initDevices(devices);
    });

    ipcRenderer.on('add-device', (e, device) => {
      DeviceActions.addDevice(device);
    });

    ipcRenderer.on('remove-device', (e, device) => {
      DeviceActions.removeDevice(device);
    });
  }

  handleDateFilter(date) {
    this.setState({ dateFilter: date });
  }

  render() {
    return (
      <div id="ansel">
        <Sidebar setDateFilter={this.handleDateFilter.bind(this)} />
        <Container dateFilter={this.state.dateFilter} />
      </div>
    );
  }
}

export default Ansel;
