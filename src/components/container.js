import fs from 'fs';
import React from 'react';
import ReactDOM from 'react-dom';

import Library from './library';
import Settings from './settings';

import config from './../config';

class Container extends React.Component {
  handleScrollTop(scrollTop) {
    ReactDOM.findDOMNode(this).scrollTop = scrollTop;
  }

  render() {
    let content = <Settings />;

    if (fs.existsSync(config.settings))
      content = <Library setScrollTop={this.handleScrollTop.bind(this)}/>;

    return (
      <div id="container">
        {content}
      </div>
    );
  }
}

export default Container;
