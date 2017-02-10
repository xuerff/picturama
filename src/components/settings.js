import {remote, ipcRenderer} from 'electron';
import fs from 'fs';
import React from 'react';

import config from '../config';

const dialog = remote.dialog;

class Settings extends React.Component {
  static propTypes = {
    actions: React.PropTypes.object.isRequired
  }

  constructor(props) {
    super(props);

    this.state = { directories: { photos: '', versions: '' } };
  }

  onPhotosFolderSelection(filenames) {
    console.log('filenames', filenames);
    let state = this.state;

    state.directories.photos = filenames[0];

    this.setState(state);
  }

  openPhotosDialog() {
    dialog.showOpenDialog(
      { properties: [ 'openDirectory' ]},
      this.onPhotosFolderSelection.bind(this)
    );
  }

  onVersionsFolderSelection(filenames) {
    console.log('filenames', filenames);
    let state = this.state;

    state.directories.versions = filenames[0];

    this.setState(state);
  }

  openVersionsDialog() {
    dialog.showOpenDialog(
      { properties: [ 'openDirectory' ]},
      this.onVersionsFolderSelection.bind(this)
    );
  }

  save() {
    let settings = JSON.stringify(this.state, null, 2);
    fs.writeFile(config.settings, settings, this.onSavedFile.bind(this));
  }

  onSavedFile(err) {
    if (!err) {
      ipcRenderer.send('settings-created', true);
      this.props.actions.areSettingsExisting();
    }
  }

  render() {
    return (
      <div className="settings-container">
        <div className="info">
          <h1>Ansel</h1>
          <h2>Digital image organizer powered by the web</h2>

          <p>Please select the main photos folder to scan from, as well as a versions folder in which we'll put the processed pictures.</p>

          <div>
            <button id="photos-dir" onClick={this.openPhotosDialog.bind(this)}>
              {this.state.directories.photos || 'Photos directory'}
            </button>
          </div>

          <div>
            <button id="versions-dir" onClick={this.openVersionsDialog.bind(this)}>
              {this.state.directories.versions || 'Versions directory'}
            </button>

            <p>Version folder where you put all your externally processed photos</p>
          </div>

          <button className="save" onClick={this.save.bind(this)}>Save</button>
        </div>

        <img src="../static/ansel.svg" className="logo" />
      </div>
    );
  }
}

export default Settings;
