import {remote} from 'electron';
//import {ipcRenderer} from 'electron';
import React from 'react';

const dialog = remote.dialog;

class LocalConf extends React.Component {
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

        <button>Save</button>
      </div>
    );
  }
}

export default LocalConf;
