import { ipcRenderer } from 'electron';
import classNames from 'classnames';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as action from './../actions';

import Sidebar from './sidebar';
import Container from './container';
import DevTools from './dev-tools';

class Ansel extends React.Component {
  static propTypes = {
    dispatch: React.PropTypes.func.isRequired,
    dates: React.PropTypes.object.isRequired,
    importing: React.PropTypes.bool.isRequired,
    currentDate: React.PropTypes.string,
    photos: React.PropTypes.array.isRequired
  }

  constructor(props) {
    super(props);

    this.state = {
      showSidebar: true,
      actions: bindActionCreators(action, this.props.dispatch)
    };

    //ipcRenderer.on('remove-device', (e, device) => {
    //  DeviceActions.removeDevice(device);
    //});

    this.keyboardListener = this.keyboardListener.bind(this);
  }

  handleDateFilter(date) {
    this.setState({ dateFilter: date });
  }

  componentDidMount() {

    ipcRenderer.on('start-import', this.state.actions.startImport);
    ipcRenderer.on('progress', this.state.actions.importProgress);

    ipcRenderer.on('finish-import', () => {
      this.state.actions.getPhotos();
      this.state.actions.getDates();
    });

    ipcRenderer.on('new-version', this.state.actions.updatedPhoto);
    ipcRenderer.on('scanned-devices', this.state.actions.initDevices);
    ipcRenderer.on('add-device', this.state.actions.addDevice);
    ipcRenderer.on('remove-device', this.state.actions.removeDevice);

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
      sidebar = (
        <Sidebar
          actions={this.state.actions}
          dates={this.props.dates}
          currentDate={this.props.currentDate}
          setDateFilter={this.handleDateFilter.bind(this)} />
      );

    return (
      <div id="ansel">
        {sidebar}

        <Container
          actions={this.state.actions}
          photos={this.props.photos}
          importing={this.props.importing}
          className={containerClass}
          dateFilter={this.state.dateFilter} />

        <DevTools visibleOnLoad={false} />
      </div>
    );
  }
}

const ReduxAnsel = connect(state => ({
  photos: state.photos,
  dates: state.dates,
  currentDate: state.currentDate,
  importing: state.importing
}))(Ansel);

export default ReduxAnsel;
