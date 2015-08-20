import React from 'react';
import Sidebar from './sidebar';
import Container from './container';

class Ansel extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  handleDateFilter(date) {
    this.setState({ dateFilter: date });
  }

  render() {
   return (
      <div id="ansel">
        <Sidebar setDateFilter={this.handleDateFilter.bind(this)} />
        <Container dateFilter={this.state.dateFilter} />
      </div>
    );
  }
}

export default Ansel;
