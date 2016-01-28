import fs from 'fs';
import React from 'react';
import ReactDOM from 'react-dom';

import Library from './library';
import Settings from './settings';

import config from './../config';

class Container extends React.Component {
  constructor(props) {
    super(props);

    this.areSettingsExisting = this.areSettingsExisting.bind(this);

    this.state = { settingsExists: false };
  }

  handleScrollTop(scrollTop) {
    ReactDOM.findDOMNode(this).scrollTop = scrollTop;
  }

  areSettingsExisting() {
    let state = this.state;
    state.settingsExists = fs.existsSync(config.settings);
    this.setState(state);
  }

  componentDidMount() {
    this.areSettingsExisting();
  }

  render() {
    let content = <Settings setSavedFile={this.areSettingsExisting}/>;

    if (this.state.settingsExists)
      content = <Library setScrollTop={this.handleScrollTop.bind(this)}/>;

    return (
      <div id="container">
        {content}
      </div>
    );
  }
}

export default Container;
