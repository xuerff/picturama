import {spawn} from 'child_process';
import {ipcRenderer} from 'electron';

import React from 'react';
import Loader from 'react-loader';

import VersionStore from './../stores/version-store';
import VersionActions from './../actions/version-actions';

import remote from 'remote';

import AddTags from './add-tags';
import PictureInfo from './picture-info';

var Menu = remote.require('menu');
var MenuItem = remote.require('menu-item');

var rotation = {};
rotation[1] = '';
rotation[0] = 'minus-ninety';

class PictureDetail extends React.Component {

  constructor(props) {
    super(props);

    this.state = { binded: false, modalIsOpen: false, loaded: false };

    this.keyboardListener = this.keyboardListener.bind(this);
    this.contextMenu = this.contextMenu.bind(this);
    this.bindEventListeners = this.bindEventListeners.bind(this);
    this.unbindEventListeners = this.unbindEventListeners.bind(this);
    this.closeTagDialog = this.closeTagDialog.bind(this);
    this.finishLoading = this.finishLoading.bind(this);
  }

  updateVersion(store) {
    if (store.version) this.setState(store);
  }

  keyboardListener(e) {
    e.preventDefault();

    if ([27, 37, 39, 80].indexOf(e.keyCode) != -1)
      this.unbindEventListeners();

    if (e.keyCode == 27 && !this.state.modalIsOpen) // escape
      this.props.setCurrent(null);

    else if (e.keyCode == 27 && this.state.modalIsOpen) // escape
      this.closeTagDialog();

    else if (e.keyCode == 37) // Left
      this.props.setLeft();

    else if (e.keyCode == 39 && !this.props.isLast()) // Right
      this.props.setRight();

    else if (e.keyCode == 80) // p
      this.props.toggleFlag();

    else if (e.keyCode == 89 && this.props.photo.versionNumber > 1) // y
      this.props.showDiff();

    else if (this.props.isLast() && !this.state.binded)
      this.bindEventListeners();
  }

  contextMenu(e) {
    e.preventDefault();
    this.menu.popup(remote.getCurrentWindow());
  }

  openWithRawtherapee() {
    VersionActions.createVersionAndOpenWith(
      this.props.photo, 
      'RAW', 
      'rawtherapee'
    );
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
    this.unbindEventListeners();

    var state = this.state;
    state.modalIsOpen = true;
    this.setState(state);
  }

  closeTagDialog() {
    this.bindEventListeners();

    var state = this.state;
    state.modalIsOpen = false;
    this.setState(state);
  }

  componentDidMount() {
    //console.log('start loader');
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

  finishLoading() {
    //console.log('stop loader');
    let state = this.state;

    state.loaded = true;

    this.setState(state);
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
    ipcRenderer.removeListener('addTagClicked', this.showTagDialog.bind(this));
    ipcRenderer.removeAllListeners('addTagClicked');
  }

  render() {
    var className = [
      'shadow--2dp',
      rotation[this.props.photo.orientation] 
    ].join(' ');

    var showModal;

    if (this.state.modalIsOpen)
      showModal = (
        <AddTags 
          photo={this.props.photo} 
          closeTagDialog={this.closeTagDialog} />
      );

    return (
      <div className="picture-detail">
        <div className="v-align">
          <img
            src={this.props.photo.thumb} 
            onLoad={this.finishLoading}
            className={className} />
        </div>

        <PictureInfo photo={this.props.photo} />
        <Loader loaded={this.state.loaded} />

        {showModal}
      </div>
    );
  }
}

export default PictureDetail;
