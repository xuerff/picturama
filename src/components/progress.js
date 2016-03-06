import fs from 'fs';
import React from 'react';
import { connect } from 'react-redux';

import config from './../config';

var settings = {};

if (fs.existsSync(config.settings))
  settings = require(config.settings);

class Progress extends React.Component {
  static propTypes = {
    actions: React.PropTypes.object.isRequired,
    progress: React.PropTypes.object.isRequired
  }

  constructor(props) {
    super(props);

    this.getProgress = this.getProgress.bind(this);

    this.state = {
      progress: { processed: 0, total: 0 }, timer: new Date().getTime()
    };
  }

  getProgress() {
    let progress = this.props.progress;
    return progress.processed / (progress.total / 100) || 0;
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
        <p>{this.props.progress.processed} / {this.props.progress.total}</p>
      </div>
    );
  }
}

const ReduxProgress = connect(state => ({
  progress: state.progress
}))(Progress);

export default ReduxProgress;
