import React from 'react';

import PhotoStore from './../stores/photo-store';
import PhotoActions from './../actions/photo-actions';

import Picture from './picture';
import PictureDetail from './picture-detail';

class Library extends React.Component {

  constructor(props) {
    super(props);
    this.state = { photos: [], current: null, scrollTop: 0 };

    this.updateCurrent = this.updateCurrent.bind(this);
  }

  handleCurrent(photo) {
    let state = this.state;

    state.current = photo;

    if (state.current)
      state.scrollTop = React.findDOMNode(this).parentNode.scrollTop;
    else
      this.props.setScrollTop(state.scrollTop);

    this.setState(state);
  }

  handleLeftCurrent() {
    var state = this.state;

    if (state.photos.indexOf(state.current) >= 1) {
      state.current = state.photos[state.photos.indexOf(state.current) - 1];
      this.setState(state);
    }
  }

  handleRightCurrent() {
    var state = this.state;

    if (state.photos.length > state.photos.indexOf(state.current) + 1) {
      state.current = state.photos[state.photos.indexOf(state.current) + 1];
      this.setState(state);
    }
  }

  componentDidMount() {
    PhotoStore.listen(this.updatePhotos.bind(this));
    PhotoActions.getPhotos();
  }

  updateCurrent() {
    var state = this.state;
    var current = this.state.current;

    this.state.current = null;

    state.photos.forEach(function(photo) {
      if (photo.id == current.id)
        state.current = photo;
    });

    this.setState(state);
  }

  updatePhotos(store) {
    if (store.photos) {
      this.setState({ photos: store.photos });

      if (this.state.current) this.updateCurrent();
    }
  }

  isLast() {
    let state = this.state;

    if (state.photos.length == state.photos.indexOf(state.current) + 1)
      return true;
    else if (state.photos.indexOf(state.current) == 0)
      return true;
    else
      return false;
  }

  render() {
    let currentView;
    let handleCurrent = this.handleCurrent.bind(this);
    let handleLeftCurrent = this.handleLeftCurrent.bind(this);
    let handleRightCurrent = this.handleRightCurrent.bind(this);
    let isLast = this.isLast.bind(this);

    if (!this.state.current)
      currentView = this.state.photos.map(function(photo) {
        return (
          <Picture
            photo={photo}
            setCurrent={handleCurrent} />
        );
      });

    else
      currentView = <PictureDetail
                      photo={this.state.current}
                      setCurrent={handleCurrent}
                      isLast={isLast}
                      setLeft={handleLeftCurrent}
                      setRight={handleRightCurrent} />

    return (
      <div id="library">
        {currentView}
      </div>
    );
  }
}

export default Library;
