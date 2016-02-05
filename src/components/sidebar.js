import React from 'react';

import PhotoActions from './../actions/photo-actions';

import Tags from './tags';
import Dates from './dates';
import Devices from './devices';

class Sidebar extends React.Component {

  constructor(props) {
    super(props);
  }

  clearFilters() {
    PhotoActions.clearDate();
    PhotoActions.getPhotos();
  }

  filterFlagged() {
    PhotoActions.getFlagged();
  }

  render() {
    return (
      <div id="sidebar">
        <h2><i className="fa fa-camera-retro"></i> Library</h2>

        <div className="sidebar-content">
          <button 
            onClick={this.clearFilters.bind(this)} 
            className="button">
            <i className="fa fa-book"></i> All content
          </button>

          <button
            onClick={this.filterFlagged.bind(this)}
            className="button flagged">
            <i className="fa fa-flag"></i> Flagged
          </button>

          <Dates />
          <Tags />
          <Devices />
        </div>
      </div>
    );
  }
}

export default Sidebar;
