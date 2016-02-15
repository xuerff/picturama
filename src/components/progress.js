import fs from 'fs';
import React from 'react';

import PhotoStore from './../stores/photo-store';

import config from './../config';

var settings = {};

if (fs.existsSync(config.settings))
  settings = require(config.settings);

class Progress extends React.Component {
  constructor(props) {
    super(props);

    this.getProgress = this.getProgress.bind(this);

    this.state = {
      progress: { processed: 0, total: 0 }, timer: 0
    };
  }

  componentDidMount() {
    let state = this.state;
    state.timer = new Date().getTime();
    this.setState(state);

    PhotoStore.listen(this.handleProgress.bind(this));
  }

  handleProgress(store) {
    let state = this.state;
    state.progress = store.progress;
    this.setState(state);
  }

  getProgress() {
    let progress = this.state.progress;
    return progress.processed / (progress.total / 100);
  }

  render() {
    let photosDir = '';

    if (settings)
      photosDir = settings.directories.photos;

    return (
      <div id="progress">
        <h2>scanning: {photosDir}</h2>

        <div className="progress-bar">
          <div 
            className="progress-value" 
            style={{ width: this.getProgress() + '%' }}></div>
        </div>

        <p>{Math.round(this.getProgress())}%</p>
        <p>{this.state.progress.processed} / {this.state.progress.total}</p>
      </div>
    );
  }
}

export default Progress;
