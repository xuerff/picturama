import React from 'react';
import ipc from 'ipc';

import PhotoActions from './../actions/photo-actions';

import Sidebar from './sidebar';
import Container from './container';

class Ansel extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};

    ipc.on('new-version', PhotoActions.updatedPhoto);
    ipc.on('start-import', PhotoActions.startImport);

    ipc.on('finish-import', () => {
      PhotoActions.getPhotos();
      PhotoActions.getDates();
    });
  }

  handleDateFilter(date) {
    this.setState({ dateFilter: date });
  }

  render() {
    return (
      <div id="ansel">
        <Sidebar setDateFilter={this.handleDateFilter.bind(this)} />
        <Container dateFilter={this.state.dateFilter} />
      </div>
    );
  }
}

export default Ansel;
