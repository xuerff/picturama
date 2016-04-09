import {spawn} from 'child_process';
import {ipcRenderer} from 'electron';

import classNames from 'classnames';
import React from 'react';
import Loader from 'react-loader';

import createVersionAndOpenWith from './../create-version';

import remote from 'remote';

import AddTags from './add-tags';
import Export from './export';
import PictureInfo from './picture-info';

var Menu = remote.require('menu');
var MenuItem = remote.require('menu-item');

var rotation = {};
rotation[1] = '';
rotation[0] = 'minus-ninety';

export default class PictureDetail extends React.Component {
  static propTypes = {
    actions: React.PropTypes.object.isRequired,
    setCurrent: React.PropTypes.func.isRequired,
    isLast: React.PropTypes.func.isRequired,
    toggleFlag: React.PropTypes.func.isRequired,
    photo: React.PropTypes.object.isRequired
  }

  constructor(props) {
    super(props);

    this.state = { binded: false, modal: 'none', loaded: false };

    this.keyboardListener = this.keyboardListener.bind(this);
    this.contextMenu = this.contextMenu.bind(this);
    this.bindEventListeners = this.bindEventListeners.bind(this);
    this.unbindEventListeners = this.unbindEventListeners.bind(this);
    this.closeDialog = this.closeDialog.bind(this);
    this.finishLoading = this.finishLoading.bind(this);
  }

  keyboardListener(e) {
    e.preventDefault();

    if ([27, 37, 39, 80].indexOf(e.keyCode) != -1)
      this.unbindEventListeners();

    if (e.keyCode == 27 && this.state.modal == 'none') // escape
      this.props.setCurrent(-1);

    else if (e.keyCode == 27 && this.state.modal != 'none') // escape
      this.closeDialog();

    else if (e.keyCode == 37) // Left
      this.props.actions.setCurrentLeft();

    else if (e.keyCode == 39 && !this.props.isLast()) // Right
      this.props.actions.setCurrentRight();

    else if (e.keyCode == 80) // p
      this.props.toggleFlag();

    else if (e.keyCode == 89 && this.props.photo.versionNumber > 1) // y
      this.props.actions.toggleDiff();

    else if (this.props.isLast() && !this.state.binded)
      this.bindEventListeners();
  }

  contextMenu(e) {
    e.preventDefault();
    this.menu.popup(remote.getCurrentWindow());
  }

  openWithRawtherapee() {
    createVersionAndOpenWith(
      this.props.photo, 
      'RAW', 
      'rawtherapee'
    );
  }

  openWithDarktable() {
    createVersionAndOpenWith(
      this.props.photo, 
      'RAW', 
      'darktable'
    );
  }

  openWithGimp() {
    createVersionAndOpenWith(this.props.photo, 'JPG', 'gimp');
  }

  addRawtherapeeMenu() {
    this.menu.append(new MenuItem({ 
      label: 'Open with Rawtherapee', 
      click: this.openWithRawtherapee.bind(this)
    }));
  }

  addDarktableMenu() {
    this.menu.append(new MenuItem({ 
      label: 'Open with Darktable', 
      click: this.openWithDarktable.bind(this)
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
    state.modal = 'addTags';
    this.setState(state);
  }

  closeDialog() {
    this.bindEventListeners();

    var state = this.state;
    state.modal = 'none';
    this.setState(state);
  }

  showExportDialog() {
    this.unbindEventListeners();

    var state = this.state;
    state.modal = 'export';
    this.setState(state);
  }

  componentDidMount() {
    this.menu = new Menu();

    this.menu.append(new MenuItem({ 
      label: 'Add tag', 
      click: this.showTagDialog.bind(this)
    }));

    this.menu.append(new MenuItem({ 
      type: 'separator'
    }));

    let rawtherapeeCmd = spawn('which', ['rawtherapee']);
    let darktableCmd = spawn('which', ['darktable']);
    let gimpCmd = spawn('which', ['gimp']);

    rawtherapeeCmd.stdout.on('data', this.addRawtherapeeMenu.bind(this));
    darktableCmd.stdout.on('data', this.addDarktableMenu.bind(this));
    gimpCmd.stdout.on('data', this.addGimpMenu.bind(this));

    this.bindEventListeners();
  }

  finishLoading() {
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
    ipcRenderer.send('toggleExportMenu', true);

    ipcRenderer.on('addTagClicked', this.showTagDialog.bind(this));
    ipcRenderer.on('exportClicked', this.showExportDialog.bind(this));
  }

  unbindEventListeners() {
    let state = this.state;
    state.binded = false;
    this.setState(state);

    document.removeEventListener('keyup', this.keyboardListener);
    document.removeEventListener('contextmenu', this.contextMenu);

    ipcRenderer.send('toggleAddTagMenu', false);
    ipcRenderer.send('toggleExportMenu', false);

    ipcRenderer.removeAllListeners('addTagClicked');
    ipcRenderer.removeAllListeners('exportClicked');
  }

  render() {
    let imgClass = classNames(
      'shadow--2dp',
      rotation[this.props.photo.orientation] 
    );

    var showModal;

    if (this.state.modal == 'addTags')
      showModal = (
        <AddTags 
          photo={this.props.photo} 
          actions={this.props.actions}
          closeTagDialog={this.closeDialog} />
      );

    else if (this.state.modal == 'export')
      showModal = (
        <Export
          photo={this.props.photo} 
          closeExportDialog={this.closeDialog} />
      );

    return (
      <div className="picture-detail" ref="pictureDetail">
        <div className="v-align">
          <img
            src={this.props.photo.thumb} 
            onLoad={this.finishLoading}
            className={imgClass} />
        </div>

        <PictureInfo photo={this.props.photo} />
        <Loader loaded={this.state.loaded} />

        {showModal}
      </div>
    );
  }
}
