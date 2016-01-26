import React from 'react';
import ReactDOM from 'react-dom';

import Library from './library';

class Container extends React.Component {
  handleScrollTop(scrollTop) {
    ReactDOM.findDOMNode(this).scrollTop = scrollTop;
  }

  render() {
    return (
      <div id="container">
        <Library setScrollTop={this.handleScrollTop.bind(this)}/>
      </div>
    );
  }
}

export default Container;
