import {remote} from 'electron';
import fs from 'fs';
import React from 'react';

import config from '../config';

const dialog = remote.dialog;

class Settings extends React.Component {
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
    //fs.writeFile(config.settings, settings, this.onSavedFile.bind(this));
    fs.writeFile(config.settings, settings, this.props.setSavedFile);
  }

  onSavedFile(err) {
    if (!err)
      console.log('file saved');
    else
      console.log('err', err);
  }

  render() {
    return (
      <div>
        <h1>Settings</h1>

        <div>
          <label for="photos-dir">Photos directory</label>

          <button id="photos-dir" onClick={this.openPhotosDialog.bind(this)}>
            Photos directory {this.state.directories.photos}
          </button>
        </div>

        <div>
          <label for="versions-dir">Photos directory</label>

          <button id="versions-dir" onClick={this.openVersionsDialog.bind(this)}>
            Versions directory {this.state.directories.versions}
          </button>
        </div>

        <button onClick={this.save.bind(this)}>Save</button>
      </div>
    );
  }
}

export default Settings;
