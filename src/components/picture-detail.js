import { ipcRenderer, remote } from 'electron';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import React from 'react';
import Loader from 'react-loader';

import keymapManager from './../keymap-manager';
import createVersionAndOpenWith from './../create-version';
import AvailableEditors from './../available-editors';

import AddTags from './add-tags';
import Export from './export';
import PictureInfo from './picture-info';

const { Menu, MenuItem } = remote;

const availableEditors = new AvailableEditors();

let rotation = {};

rotation[1] = '';
rotation[0] = 'minus-ninety';

export default class PictureDetail extends React.Component {
  static propTypes = {
    actions: PropTypes.object.isRequired,
    isLast: PropTypes.func.isRequired,
    toggleFlag: PropTypes.func.isRequired,
    photo: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props);

    this.state = { binded: false, modal: 'none', loaded: false };

    this.contextMenu = this.contextMenu.bind(this);
    this.bindEventListeners = this.bindEventListeners.bind(this);
    this.unbindEventListeners = this.unbindEventListeners.bind(this);
    this.closeDialog = this.closeDialog.bind(this);
    this.finishLoading = this.finishLoading.bind(this);
    this.cancelEvent = this.cancelEvent.bind(this);
    this.toggleDiff = this.toggleDiff.bind(this);
    this.moveToTrash = this.moveToTrash.bind(this);
    this.addEditorMenu = this.addEditorMenu.bind(this);
  }

  contextMenu(e) {
    e.preventDefault();
    this.menu.popup(remote.getCurrentWindow());
  }

  addEditorMenu(editor) {
    this.menu.append(new MenuItem({
      label: `Open with ${editor.name}`,
      click: () => {
        createVersionAndOpenWith(
          this.props.photo,
          editor.format,
          editor.cmd
        );
      }
    }));
  }

  showTagDialog() {
    this.unbindEventListeners();

    let state = this.state;

    state.modal = 'addTags';
    this.setState(state);
  }

  closeDialog() {
    this.bindEventListeners();

    let state = this.state;

    state.modal = 'none';
    this.setState(state);
  }

  showExportDialog() {
    this.unbindEventListeners();

    let state = this.state;

    state.modal = 'export';
    this.setState(state);
  }

  cancelEvent() {
    if (this.state.modal === 'none') // escape
      this.props.actions.setCurrent(-1);
    else
      this.closeDialog();
  }

  moveToTrash() {
    this.props.actions.moveToTrash(this.props.photo);
  }

  toggleDiff() {
    if (this.props.photo.versionNumber > 1)
      this.props.actions.toggleDiff();
  }

  componentDidMount() {
    this.menu = new Menu();

    this.menu.append(new MenuItem({
      label: 'Add tag',
      click: this.showTagDialog.bind(this)
    }));

    this.menu.append(new MenuItem({
      label: 'Export',
      click: this.showExportDialog.bind(this)
    }));

    this.menu.append(new MenuItem({
      label: 'Move to trash',
      click: this.moveToTrash
    }));

    this.menu.append(new MenuItem({
      type: 'separator'
    }));

    availableEditors.editors.forEach(this.addEditorMenu);

    window.addEventListener('core:cancel', this.cancelEvent);
    window.addEventListener('detail:diff', this.toggleDiff);
    window.addEventListener('detail:flag', this.props.toggleFlag);
    window.addEventListener('detail:moveToTrash', this.moveToTrash);

    window.addEventListener(
      'detail:moveLeft',
      this.props.actions.setCurrentLeft
    );

    window.addEventListener(
      'detail:moveRight',
      this.props.actions.setCurrentRight
    );

    keymapManager.bind(this.refs.detail);
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

    window.removeEventListener('core:cancel', this.cancelEvent);
    window.removeEventListener('detail:diff', this.toggleDiff);
    window.removeEventListener('detail:flag', this.props.toggleFlag);
    window.removeEventListener('detail:moveToTrash', this.moveToTrash);

    window.removeEventListener(
      'detail:moveLeft',
      this.props.actions.setCurrentLeft
    );

    window.removeEventListener(
      'detail:moveRight',
      this.props.actions.setCurrentRight
    );

    keymapManager.unbind();
    delete this.menu;
  }

  bindEventListeners() {
    let state = this.state;

    state.binded = true;
    this.setState(state);

    document.addEventListener('contextmenu', this.contextMenu);

    ipcRenderer.send('toggleAddTagMenu', true);
    ipcRenderer.send('toggleExportMenu', true);

    ipcRenderer.on('addTagClicked', this.showTagDialog.bind(this));
  }

  unbindEventListeners() {
    let state = this.state;

    state.binded = false;
    this.setState(state);

    document.removeEventListener('contextmenu', this.contextMenu);

    ipcRenderer.send('toggleAddTagMenu', false);
    ipcRenderer.send('toggleExportMenu', false);

    ipcRenderer.removeAllListeners('addTagClicked');
  }

  render() {
    let imgClass = classNames(
      'shadow--2dp',
      rotation[this.props.photo.orientation]
    );

    let showModal;

    if (this.state.modal === 'addTags') {
      showModal = <AddTags
        photo={this.props.photo}
        actions={this.props.actions}
        closeTagDialog={this.closeDialog} />;
    } else if (this.state.modal === 'export') {
      showModal = <Export
        actions={this.props.actions}
        photos={[ this.props.photo ]}
        closeExportDialog={this.closeDialog} />;
    }

    return (
      <div className="picture-detail" ref="detail">
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
