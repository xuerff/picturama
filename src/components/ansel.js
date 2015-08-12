import React from 'react';
import Sidebar from './sidebar';
import Container from './container';

class Ansel extends React.Component {
  render() {
   return (
      <div id="ansel">
        <Sidebar />
        <Container />
      </div>
    );
  }
}

export default Ansel;
