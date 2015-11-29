import {spawn} from 'child_process';
import {ipcRenderer} from 'electron';

import React from 'react';

import VersionStore from './../stores/version-store';
import VersionActions from './../actions/version-actions';

import remote from 'remote';

import AddTag from './add-tag';

var Menu = remote.require('menu');
var MenuItem = remote.require('menu-item');

var rotation = {};
rotation[1] = '';
rotation[8] = 'minus-ninety';

class PictureDetail extends React.Component {

  constructor(props) {
    super(props);

    this.state = { binded: false, modalIsOpen: false };

    this.keyboardListener = this.keyboardListener.bind(this);
    this.contextMenu = this.contextMenu.bind(this);
    this.bindEventListeners = this.bindEventListeners.bind(this);
    this.unbindEventListeners = this.unbindEventListeners.bind(this);
    this.closeTagDialog = this.closeTagDialog.bind(this);
  }

  updateVersion(store) {
    if (store.version) this.setState(store);
  }

  keyboardListener(e) {
    //if ([27, 37, 39, 80, 89].indexOf(e.keyCode) != -1)
    if ([27, 37, 39, 80].indexOf(e.keyCode) != -1)
      this.unbindEventListeners();

    if (e.keyCode == 27 && !this.state.modalIsOpen) // escape
      this.props.setCurrent(null);

    else if (e.keyCode == 27 && this.state.modalIsOpen) // escape
      this.closeTagDialog();

    else if (e.keyCode == 37) // Left
      this.props.setLeft();

    else if (e.keyCode == 39) // Right
      this.props.setRight();

    else if (e.keyCode == 80) // p
      this.props.toggleFlag();

    else if (e.keyCode == 89 && this.props.photo.versionNumber > 1) { // y
      this.props.showDiff();
      this.unbindEventListeners();
    }

    if (this.props.isLast() && !this.state.binded)
      this.bindEventListeners();
  }

  contextMenu(e) {
    e.preventDefault();
    this.menu.popup(remote.getCurrentWindow());
  }

  shutterSpeed(exposureTime) {
    var zeros = -Math.floor( Math.log(exposureTime) / Math.log(10));
    return '1/' + Math.pow(10, zeros);
  }

  openWithRawtherapee() {
    VersionActions.createVersionAndOpenWith(this.props.photo, 'RAW', 'rawtherapee');
  }

  openWithGimp() {
    VersionActions.createVersionAndOpenWith(this.props.photo, 'JPG', 'gimp');
  }

  addRawtherapeeMenu() {
    this.menu.append(new MenuItem({ 
      label: 'Open with Rawtherapee', 
      click: this.openWithRawtherapee.bind(this)
    }));
  }

  addGimpMenu() {
    this.menu.append(new MenuItem({ 
      label: 'Open with Gimp', 
      click: this.openWithGimp.bind(this)
    }));
  }

  showTagDialog() {
    var state = this.state;
    console.log('show tag dialog', state);
    state.modalIsOpen = true;
    this.setState(state);
  }

  closeTagDialog() {
    var state = this.state;
    state.modalIsOpen = false;
    this.setState(state);
  }

  componentDidMount() {
    VersionStore.listen(this.updateVersion.bind(this));

    this.menu = new Menu();

    this.menu.append(new MenuItem({ 
      label: 'Add tag', 
      click: this.showTagDialog.bind(this)
    }));

    this.menu.append(new MenuItem({ 
      type: 'separator'
    }));

    let rawtherapeeCmd = spawn('which', ['rawtherapee']);
    let gimpCmd = spawn('which', ['gimp']);

    rawtherapeeCmd.stdout.on('data', this.addRawtherapeeMenu.bind(this));
    gimpCmd.stdout.on('data', this.addGimpMenu.bind(this));

    this.bindEventListeners();
  }

  componentWillReceiveProps() {
    this.bindEventListeners();
  }

  componentWillUnmount() {
    this.unbindEventListeners();

    delete this.menu;
  }

  bindEventListeners() {
    let state = this.state;
    state.binded = true;
    this.setState(state);

    document.addEventListener('keyup', this.keyboardListener);
    document.addEventListener('contextmenu', this.contextMenu);

    ipcRenderer.send('toggleAddTagMenu', true);
    ipcRenderer.on('addTagClicked', this.showTagDialog.bind(this));
  }

  unbindEventListeners() {
    let state = this.state;
    state.binded = false;
    this.setState(state);

    document.removeEventListener('keyup', this.keyboardListener);
    document.removeEventListener('contextmenu', this.contextMenu);

    ipcRenderer.send('toggleAddTagMenu', false);
  }

  render() {
    var className = [ 'mdl-shadow--2dp', rotation[this.props.photo.orientation] ].join(' ');

    var showModal;

    if (this.state.modalIsOpen)
      showModal = <AddTag />;

    return (
      <div className="picture-detail">
        <div className="v-align">
          <img
            src={this.props.photo.thumb} 
            className={className} />
        </div>

        <div className="picture-info mdl-card mdl-shadow--2dp">
          <ul>
            <li className="title">{this.props.photo.title}</li>
            <li>ISO: {this.props.photo.iso}</li>
            <li>f/{this.props.photo.aperture}</li>
            <li>@ {this.shutterSpeed(this.props.photo.exposure_time)}</li>
            <li>v#: {this.props.photo.versionNumber}</li>
            <li>Flag: {this.props.photo.flag}</li>
          </ul>
        </div>

        {showModal}
      </div>
    );
  }
}

export default PictureDetail;
