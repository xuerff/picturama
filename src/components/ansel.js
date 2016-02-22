import classNames from 'classnames';
import React from 'react';
import {ipcRenderer} from 'electron';

import PhotoActions from './../actions/photo-actions';
import DeviceActions from './../actions/device-actions';

import Sidebar from './sidebar';
import Container from './container';

class Ansel extends React.Component {

  constructor(props) {
    super(props);
    this.state = { showSidebar: true };

    ipcRenderer.on('new-version', PhotoActions.updatedPhoto);
    ipcRenderer.on('start-import', PhotoActions.startImport);
    ipcRenderer.on('progress', PhotoActions.importProgress);

    ipcRenderer.on('finish-import', () => {
      PhotoActions.getPhotos();
      PhotoActions.getDates();
    });

    ipcRenderer.on('scanned-devices', (e, devices) => {
      DeviceActions.initDevices(devices);
    });

    ipcRenderer.on('add-device', (e, device) => {
      DeviceActions.addDevice(device);
    });

    ipcRenderer.on('remove-device', (e, device) => {
      DeviceActions.removeDevice(device);
    });

    this.keyboardListener = this.keyboardListener.bind(this);
  }

  handleDateFilter(date) {
    this.setState({ dateFilter: date });
  }

  componentDidMount() {
    document.addEventListener('keyup', this.keyboardListener);
  }

  componentWillUnmount() {
    document.removeEventListener('keyup', this.keyboardListener);
  }

  keyboardListener(e) {
    let state = this.state;

    if (e.keyCode == 9) // ESC key
      state.showSidebar = !state.showSidebar;

    this.setState(state);
  }

  render() {
    let sidebar = null;

    let containerClass = classNames({ 
      'no-sidebar': !this.state.showSidebar
    });

    if (this.state.showSidebar)
      sidebar = <Sidebar setDateFilter={this.handleDateFilter.bind(this)} />;

    return (
      <div id="ansel">
        {sidebar}

        <Container
          className={containerClass}
          dateFilter={this.state.dateFilter} />
      </div>
    );
  }
}

export default Ansel;
