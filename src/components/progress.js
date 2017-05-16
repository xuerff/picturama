import React from 'react';
import { connect } from 'react-redux';

class Progress extends React.Component {
  static propTypes = {
    progress: React.PropTypes.object.isRequired
  }

  constructor(props) {
    super(props);

    this.getProgress = this.getProgress.bind(this);

    this.state = {
      progress: { processed: 0, total: 0 },
      timer: new Date().getTime()
    };
  }

  getProgress() {
    let progress = this.props.progress;

    return progress.processed / (progress.total / 100) || 0;
  }

  render() {
    return (
      <div id="progress">
        <h2>scanning: {this.props.progress.photosDir}</h2>

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
