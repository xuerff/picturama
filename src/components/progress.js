import React from 'react';

import PhotoStore from './../stores/photo-store';

class Progress extends React.Component {
  constructor(props) {
    super(props);

    this.state = { progress: {
      processed: 0, total: 0
    } };
  }

  componentDidMount() {
    PhotoStore.listen(this.handleProgress.bind(this));
  }

  handleProgress(store) {
    console.log('handle progress', store);
    this.setState({ progress: store.progress });
  }

  render() {
    return (
      <div id="progress">
        <p>this is a progress bar</p>
        <p>{this.state.progress.processed} / {this.state.progress.total}</p>
      </div>
    );
  }
}

export default Progress;
