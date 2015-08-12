import React from 'react';

import Photo from './../models/photo';

import Picture from './picture';
import PictureDetail from './picture-detail';

class Library extends React.Component {

  constructor(props) {
    super(props);
    this.state = { photos: [], current: null };
  }

  handleCurrent(photo) {
    var state = this.state;
    state.current = photo;
    this.setState(state);
  }

  //getInitialState: function() {
  //  return { photos: [], current: null };
  //},

  componentDidMount() {
    var self = this;

    new Photo().fetchAll().then(function(photos) {
      console.log('photos', photos.toJSON());
      self.setState({ photos: photos.toJSON() });
    });
  }

  render() {
    let currentView;
    let handleCurrent = this.handleCurrent.bind(this);
    console.log('current photo', this.state.current);

    if (!this.state.current)
      currentView = this.state.photos.map(function(photo) {
        return (
          <Picture photo={photo} setCurrent={handleCurrent} />
        );
      });
    else
      currentView = <PictureDetail photo={this.state.current} setCurrent={handleCurrent} />;

    return (
      <div id="library">
        {currentView}
      </div>
    );
  }
}

export default Library;
