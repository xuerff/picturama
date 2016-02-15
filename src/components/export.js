import {remote} from 'electron';
import sharp from 'sharp';
import React from 'react';

import config from './../config';

class Export extends React.Component {
  constructor(props) {
    super(props);

    this.state = { folder: null, quality: 90, format: config.exportFormats[0] };

    this.keyboardListener = this.keyboardListener.bind(this);
  }

  componentDidMount() {
    document.addEventListener('keyup', this.keyboardListener);
  }

  componentWillUnmount() {
    document.removeEventListener('keyup', this.keyboardListener);
  }

  keyboardListener(e) {
    e.preventDefault();

    if (e.keyCode == 27) // escape
      this.props.closeExportDialog();
  }

  onFolderSelection(filenames) {
    console.log('filenames', filenames);
    let state = this.state;
    state.folder = filenames[0];
    this.setState(state);
  }

  openFolderDialog() {
    remote.dialog.showOpenDialog(
      { properties: [ 'openDirectory' ]},
      this.onFolderSelection.bind(this)
    );
  }

  handleSubmit(e) {
    e.preventDefault();
    console.log('save', this.state, this.props.photo);

    let photo = this.props.photo;

    // TODO: Proceed to the actual export
    if (photo.versions.length > 0)
      sharp(photo.thumb)
        .quality(this.state.quality)
        .toFile(`${this.state.folder}/${photo.title}.${this.state.format}`);
  }

  updateQuality() {
    let state = this.state;
    state.quality = this.refs.quality.value;
    this.setState(state);
  }

  updateFormat() {
    let state = this.state;
    state.format = this.refs.format.value;
    this.setState(state);
  }

  render() {
    let formats = config.exportFormats.map((exportFormat) => {
      return <option value={exportFormat}>{exportFormat}</option>;
    });

    return (
      <div className="outer-modal">
        <div className="modal shadow--2dp">
          <form onSubmit={this.handleSubmit.bind(this)}>
            <div>
              <label for="format">Format:</label>
              <select 
                id="format" 
                ref="format" 
                value={this.state.format}
                onChange={this.updateFormat.bind(this)}>{formats}</select>
            </div>

            <div>
              <label for="quality">Quality</label>

              <input
                type="range" 
                id="quality" 
                ref="quality"
                min="10" 
                max="100" 
                value={this.state.quality}
                onChange={this.updateQuality.bind(this)}
                step="1" />

              {this.state.quality}
            </div>

            <div>
              <label for="folder">Folder:</label>

              <button id="folder" onClick={this.openFolderDialog.bind(this)}>
                export to: {this.state.folder}
              </button>
            </div>

            <button>Save</button>
          </form>
        </div>
      </div>
    );
  }
}

export default Export;
