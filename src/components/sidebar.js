import fs from 'fs';
import React from 'react';

import Tags from './tags';
import Dates from './dates';
import Devices from './devices';

import config from './../config';

var settings;

if (fs.existsSync(config.settings))
  settings = require(config.settings);

class Sidebar extends React.Component {
  static propTypes = {
    //dates: React.PropTypes.object.isRequired,
    actions: React.PropTypes.object.isRequired
    //currentDate: React.PropTypes.string.isRequired
  }

  constructor(props) {
    super(props);
  }

  render() {
    var menus = [
      <Dates 
        key="0"
        actions={this.props.actions} />,
      <Tags key="1" actions={this.props.actions} />,
      <Devices key="2" />
    ];

    if (settings && settings.hasOwnProperty('menus')) {
      menus = [];

      settings.menus.forEach((menu, key) => {
        if (menu == 'dates')
          menus.push(
            <Dates 
              key={key} 
              actions={this.props.actions} />
          );

        else if (menu == 'tags')
          menus.push(<Tags key={key} actions={this.props.actions} />);

        else if (menu == 'devices')
          menus.push(<Devices key={key} />);
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
            onClick={this.props.actions.getProcessed}
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
