import React from 'react';

import Photo from './../models/photo';

class Sidebar extends React.Component {
  componentDidMount() {
    Photo.getByDate().then(function(photos) {
      console.log('sidebar photos', photos);
    })
    .catch(function(err) {
      console.log('err', err);
    })
  }

  render() {
    return (
      <div id="sidebar">
        This is the sidebar
        <i className="fa fa-anchor"></i>
      </div>
    );
  }
}

export default Sidebar;
