import fs from 'fs';
import React from 'react';

import PhotoActions from './../actions/photo-actions';

import Tags from './tags';
import Dates from './dates';
import Devices from './devices';

import config from './../config';

var settings;

if (fs.existsSync(config.settings))
  settings = require(config.settings);

class Sidebar extends React.Component {

  constructor(props) {
    super(props);
    console.log(settings);
  }

  clearFilters() {
    PhotoActions.clearDate();
    PhotoActions.getPhotos();
  }

  filterFlagged() {
    PhotoActions.getFlagged();
  }

  render() {
    var menus = [
      <Dates />,
      <Tags />,
      <Devices />
    ];

    if (settings.hasOwnProperty('menus')) {
      menus = [];

      settings.menus.forEach((menu) => {
        if (menu == 'dates') menus.push(<Dates />);
        else if (menu == 'tags') menus.push(<Tags />);
        else if (menu == 'devices') menus.push(<Devices />);
      });
    }

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

          {menus}
        </div>
      </div>
    );
  }
}

export default Sidebar;
