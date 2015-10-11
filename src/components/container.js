import React from 'react';
import Library from './library';

class Container extends React.Component {
  handleScrollTop(scrollTop) {
    React.findDOMNode(this).scrollTop = scrollTop;
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
