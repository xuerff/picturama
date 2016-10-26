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
    importing: React.PropTypes.bool.isRequired,
    splashed: React.PropTypes.bool.isRequired
  }

  constructor(props) {
    super(props);

    this.state = {
      showSidebar: true,
      actions: bindActionCreators(action, this.props.dispatch)
    };

    this.toggleSidebar = this.toggleSidebar.bind(this);
  }

  handleDateFilter(date) {
    this.setState({ dateFilter: date });
  }

  componentDidUpdate() {
    if (this.props.splashed === true) {
      let splash = document.getElementById('splash');
      if (splash) splash.parentNode.removeChild(splash);
    }

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
    let noSidebarClass = classNames({ 
      'no-sidebar': !this.state.showSidebar || !this.props.settingsExists
    });

    return (
      <div id="ansel">
        <Sidebar
          actions={this.state.actions}
          className={noSidebarClass}
          setDateFilter={this.handleDateFilter.bind(this)} />

        <Container
          settingsExists={this.props.settingsExists}
          actions={this.state.actions}
          importing={this.props.importing}
          className={noSidebarClass} />

      </div>
    );
  }
}

const ReduxAnsel = connect(state => ({
  importing: state.importing,
  splashed: state.splashed,
  settingsExists: state.settingsExists
}))(Ansel);

export default ReduxAnsel;
