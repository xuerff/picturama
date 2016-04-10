import { ipcRenderer } from 'electron';
import classNames from 'classnames';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as action from './../actions';

import Sidebar from './sidebar';
import Container from './container';

class Ansel extends React.Component {
  static propTypes = {
    dispatch: React.PropTypes.func.isRequired,
    settingsExists: React.PropTypes.bool.isRequired,
    importing: React.PropTypes.bool.isRequired
  }

  constructor(props) {
    super(props);

    this.state = {
      showSidebar: true,
      actions: bindActionCreators(action, this.props.dispatch)
    };

    //this.keyboardListener = this.keyboardListener.bind(this);
    this.toggleSidebar = this.toggleSidebar.bind(this);
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
      this.state.actions.getTags();
    });

    ipcRenderer.on('new-version', this.state.actions.updatedPhoto);
    ipcRenderer.on('scanned-devices', this.state.actions.initDevices);
    ipcRenderer.on('add-device', this.state.actions.addDevice);
    ipcRenderer.on('remove-device', this.state.actions.removeDevice);

    window.addEventListener('core:toggleSidebar', this.toggleSidebar);
  }

  componentWillUnmount() {
    window.removeEventListener('core:toggleSidebar', this.toggleSidebar);
  }

  toggleSidebar() {
    let state = this.state;
    state.showSidebar = !state.showSidebar;
    this.setState(state);
  }

  render() {
    let sidebar = null;

    let containerClass = classNames({ 
      'no-sidebar': !this.state.showSidebar || !this.props.settingsExists
    });

    if (this.state.showSidebar && this.props.settingsExists)
      sidebar = (
        <Sidebar
          actions={this.state.actions}
          setDateFilter={this.handleDateFilter.bind(this)} />
      );

    return (
      <div id="ansel">
        {sidebar}

        <Container
          settingsExists={this.props.settingsExists}
          actions={this.state.actions}
          importing={this.props.importing}
          className={containerClass} />

      </div>
    );
  }
}

const ReduxAnsel = connect(state => ({
  importing: state.importing,
  settingsExists: state.settingsExists
}))(Ansel);

export default ReduxAnsel;
