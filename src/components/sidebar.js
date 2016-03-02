import fs from 'fs';
import React from 'react';
//import PhotoActions from './../actions/photo-actions';


import Tags from './tags';
import Dates from './dates';
import Devices from './devices';

import config from './../config';

var settings;

if (fs.existsSync(config.settings))
  settings = require(config.settings);

class Sidebar extends React.Component {
  static propTypes = {
    actions: React.PropTypes.object.isRequired,
    getFlagged: React.PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);
  }

  //clearFilters() {
  //  PhotoActions.getPhotos();
  //}

  //filterFlagged() {
  //  PhotoActions.getFlagged();
  //}

  //filterProcessed() {
  //  PhotoActions.getProcessed();
  //}

  render() {
    var menus = [
      <Dates key="0" />,
      <Tags key="1" />,
      <Devices key="2" />
    ];

    if (settings && settings.hasOwnProperty('menus')) {
      menus = [];

      settings.menus.forEach((menu, key) => {
        if (menu == 'dates') menus.push(<Dates key={key} />);
        else if (menu == 'tags') menus.push(<Tags key={key} />);
        else if (menu == 'devices') menus.push(<Devices key={key} />);
      });
    }

    return (
      <div id="sidebar">
        <h2><i className="fa fa-camera-retro"></i> Library</h2>

        <div className="sidebar-content">
          <button 
            onClick={this.props.actions.getPhotos}
            className="button">
            <i className="fa fa-book"></i> All content
          </button>

          <button
            onClick={this.props.actions.getFlagged}
            className="button flagged">
            <i className="fa fa-flag"></i> Flagged
          </button>

          <button
            className="button">
            <i className="fa fa-pencil-square-o"></i> Processed
          </button>

          {menus}
        </div>
      </div>
    );
  }
}

export default Sidebar;
