import * as fs from 'fs'
import * as React from 'react'
import * as PropTypes from 'prop-types'

import Tags from './tags';
import Dates from './dates';
import Devices from './devices';
import Logo from './logo';
import Toolbar from './widget/Toolbar'

import config from './../config';

let settings;

if (fs.existsSync(config.settings))
  settings = require(config.settings);

const defaultMenuSettings = [ 'dates', 'tags' ]
// Don't show 'devices', since USB detection is deactivated in `browser.js`


class Sidebar extends React.Component {
  static propTypes = {
    className: PropTypes.string.isRequired,
    actions: PropTypes.object.isRequired
  }

  render() {
    const menuSettings = settings && settings.menus ? settings.menus : defaultMenuSettings;

    let menus = []
    menuSettings.forEach((menu, key) => {
      if (menu === 'dates') {
        menus.push(
          <Dates
            key={key}
            actions={this.props.actions} />
        );
      } else if (menu === 'tags')
        menus.push(<Tags key={key} actions={this.props.actions} />);

      else if (menu === 'devices')
        menus.push(<Devices key={key} />);
    });

    return (
      <div id="sidebar" className={this.props.className}>
        <Toolbar className="Sidebar-topBar"><Logo /> Library</Toolbar>

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

          <button
            onClick={this.props.actions.getTrashed}
            className="button">
            <i className="fa fa-trash-o"></i> Trash
          </button>


          {menus}
        </div>
      </div>
    );
  }
}

export default Sidebar;
