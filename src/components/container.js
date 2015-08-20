import React from 'react';
import Library from './library';

class Container extends React.Component {
  render() {
    return (
      <div id="container">
        <Library dateFilter={this.props.dateFilter}/>
      </div>
    );
  }
}

export default Container;
