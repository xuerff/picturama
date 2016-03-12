import {remote, ipcRenderer} from 'electron';
import fs from 'fs';
import React from 'react';

import config from '../config';

const dialog = remote.dialog;

class Settings extends React.Component {
  static propTypes = {
    actions: React.PropTypes.object.isRequired,
    setSavedFile: React.PropTypes.func.isRequired
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
      <div>
        <h1>Settings</h1>

        <div>
          <label htmlFor="photos-dir">Photos directory</label>

          <button id="photos-dir" onClick={this.openPhotosDialog.bind(this)}>
            Photos directory {this.state.directories.photos}
          </button>

          <p>Photo folder to digest</p>
        </div>

        <div>
          <label htmlFor="versions-dir">Photos directory</label>

          <button id="versions-dir" onClick={this.openVersionsDialog.bind(this)}>
            Versions directory {this.state.directories.versions}
          </button>

          <p>Version folder where you put all your externally processed photos</p>
        </div>

        <button onClick={this.save.bind(this)}>Save</button>
      </div>
    );
  }
}

export default Settings;
