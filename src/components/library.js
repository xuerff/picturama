import React from 'react';
import ReactDOM from 'react-dom';

import PhotoStore from './../stores/photo-store';
import PhotoActions from './../actions/photo-actions';

import Picture from './picture';
import PictureDetail from './picture-detail';
import PictureDiff from './picture-diff';

class Library extends React.Component {

  constructor(props) {
    super(props);
    this.state = { photos: [], current: null, scrollTop: 0, diff: false };

    this.updateCurrent = this.updateCurrent.bind(this);
  }

  handleCurrent(photo) {
    let state = this.state;

    state.diff = false;
    state.current = photo;

    if (state.current)
      state.scrollTop = ReactDOM
        .findDOMNode(this)
        .parentNode
        .scrollTop;

    this.setState(state);
  }

  componentDidUpdate() {
    let state = this.state;

    if (!state.current && state.scrollTop > 0) {
      this.props.setScrollTop(state.scrollTop);
      state.scrollTop = 0;
      this.setState(state);
    }
  }

  handleLeftCurrent() {
    var state = this.state;

    state.diff = false;

    if (state.photos.indexOf(state.current) >= 1) {
      state.current = state.photos[state.photos.indexOf(state.current) - 1];
      this.setState(state);
    }
  }

  handleRightCurrent() {
    var state = this.state;

    state.diff = false;

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

    this.state.diff = false;
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

  handleFlag() {
    console.log('handle flag');
    PhotoActions.toggleFlag(this.state.current);
  }

  handleDiff() {
    //console.log('start loader!');
    let state = this.state;
    state.diff = !this.state.diff;
    this.setState(state);
  }

  handleHighlight(photo) {
    let state = this.state;

    state.photos = state.photos.map((statePhoto) => {
      statePhoto.highlighted = false;

      if (statePhoto.id == photo.id)
        statePhoto.highlighted = true;

      return statePhoto;
    });

    this.setState(state);
  }

  render() {
    let currentView
      , handleCurrent = this.handleCurrent.bind(this)
      , handleLeftCurrent = this.handleLeftCurrent.bind(this)
      , handleRightCurrent = this.handleRightCurrent.bind(this)
      , isLast = this.isLast.bind(this)
      , handleFlag = this.handleFlag.bind(this)
      , handleDiff = this.handleDiff.bind(this);

    if (!this.state.current)
      currentView = this.state.photos.map((photo) => {
        return (
          <Picture
            key={photo.id}
            photo={photo}
            setHighlight={this.handleHighlight.bind(this)}
            setCurrent={handleCurrent} />
        );
      });

    else if (this.state.diff)
      currentView = <PictureDiff
                      toggleDiff={handleDiff}
                      photo={this.state.current} />;

    else
      currentView = <PictureDetail
                      photo={this.state.current}
                      toggleFlag={handleFlag}
                      setCurrent={handleCurrent}
                      showDiff={handleDiff}
                      isLast={isLast}
                      setLeft={handleLeftCurrent}
                      setRight={handleRightCurrent} />;

    return (
      <div id="library">
        {currentView}
      </div>
    );
  }
}

export default Library;
