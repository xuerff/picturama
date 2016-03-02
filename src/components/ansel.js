import classNames from 'classnames';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
//import promiseMiddleware from 'redux-promise';
//import thunk from 'redux-thunk';
//import {ipcRenderer} from 'electron';

//import { Provider } from 'react-redux';
//import { createStore, applyMiddleware } from 'redux';

//import reducers from './../reducers';

//import PhotoActions from './../actions/photo-actions';
//import DeviceActions from './../actions/device-actions';

import * as action from './../actions';

import Sidebar from './sidebar';
import Container from './container';


//const reducer = combineReducers(reducers);
//const store = createStore(reducers, applyMiddleware(thunk));

class Ansel extends React.Component {
  static propTypes = {
    dispatch: React.PropTypes.func.isRequired,
    dates: React.PropTypes.object.isRequired,
    photos: React.PropTypes.array.isRequired
  }

  constructor(props) {
    super(props);
    this.state = { showSidebar: true };

    //ipcRenderer.on('new-version', PhotoActions.updatedPhoto);
    //ipcRenderer.on('start-import', PhotoActions.startImport);
    //ipcRenderer.on('progress', PhotoActions.importProgress);

    //ipcRenderer.on('finish-import', () => {
    //  PhotoActions.getPhotos();
    //  PhotoActions.getDates();
    //});

    //ipcRenderer.on('scanned-devices', (e, devices) => {
    //  DeviceActions.initDevices(devices);
    //});

    //ipcRenderer.on('add-device', (e, device) => {
    //  DeviceActions.addDevice(device);
    //});

    //ipcRenderer.on('remove-device', (e, device) => {
    //  DeviceActions.removeDevice(device);
    //});

    //this.keyboardListener = this.keyboardListener.bind(this);
  }

  handleDateFilter(date) {
    this.setState({ dateFilter: date });
  }

  //componentDidMount() {
  //  document.addEventListener('keyup', this.keyboardListener);
  //}

  //componentWillUnmount() {
  //  document.removeEventListener('keyup', this.keyboardListener);
  //}

  //keyboardListener(e) {
  //  let state = this.state;

  //  if (e.keyCode == 9) // ESC key
  //    state.showSidebar = !state.showSidebar;

  //  this.setState(state);
  //}

  render() {
    const actions = bindActionCreators(action, this.props.dispatch);

    let sidebar = null;

    let containerClass = classNames({ 
      'no-sidebar': !this.state.showSidebar
    });

    if (this.state.showSidebar)
      sidebar = (
        <Sidebar
          actions={actions}
          dates={this.props.dates}
          setDateFilter={this.handleDateFilter.bind(this)} />
      );

    return (
      <div id="ansel">
        {sidebar}

        <Container
          actions={actions}
          photos={this.props.photos}
          className={containerClass}
          dateFilter={this.state.dateFilter} />
      </div>
    );
  }
}

const ReduxAnsel = connect(state => ({
  photos: state.photos,
  dates: state.dates
}))(Ansel);

export default ReduxAnsel;
