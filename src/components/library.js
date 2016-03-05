import React from 'react';
import ReactDOM from 'react-dom';

import Picture from './picture';
import PictureDetail from './picture-detail';
import PictureDiff from './picture-diff';

class Library extends React.Component {
  static propTypes = {
    setScrollTop: React.PropTypes.func.isRequired,
    actions: React.PropTypes.object.isRequired,
    //getPhotos: React.PropTypes.func.isRequired,
    photos: React.PropTypes.array.isRequired
  }

  constructor(props) {
    super(props);
    this.state = { highlighted: [], current: null, scrollTop: 0, diff: false };
  }

  handleCurrent(currentPhoto) {
    let state = this.state;

    state.diff = false;
    state.current = null;

    this.props.photos.forEach((photo, index) => {
      if (photo.id == currentPhoto.id)
        state.current = index;
    });

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
    let state = this.state;
    //let photos = this.props.photos;

    state.diff = false;

    //if (photos.indexOf(state.current) >= 1) {
    //  state.current = photos[photos.indexOf(state.current) - 1];
    //  this.setState(state);
    //}

    if (state.current >= 1) {
      state.current--;
      this.setState(state);
    }
  }

  handleRightCurrent() {
    let state = this.state;
    let photos = this.props.photos;

    state.diff = false;

    //if (photos.length > photos.indexOf(state.current) + 1) {
    //  state.current = photos[photos.indexOf(state.current) + 1];
    //  this.setState(state);
    //}

    if (photos.length > state.current + 1) {
      state.current++;
      this.setState(state);
    }
  }

  componentDidMount() {
    this.props.actions.getPhotos();
  }

  isLast() {
    let photos = this.props.photos;

    if (photos.length == photos.indexOf(this.state.current) + 1)
      return true;
    else if (photos.indexOf(this.state.current) == 0)
      return true;
    else
      return false;
  }

  handleFlag() {
    console.log('handle flag');
    //PhotoActions.toggleFlag(this.state.current);
  }

  handleDiff() {
    let state = this.state;
    state.diff = !this.state.diff;
    this.setState(state);
  }

  handleHighlight(photo) {
    let state = this.state;

    state.highlighted = [];
    state.highlighted.push(photo.id);

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

    if (!this.props.photos || this.props.photos.length === 0)
      currentView = <div>Nothing!</div>;

    else if (!this.state.current)
      currentView = this.props.photos.map((photo) => {
        return (
          <Picture
            key={photo.id}
            photo={photo}
            setHighlight={this.handleHighlight.bind(this)}
            highlighted={this.state.highlighted}
            setCurrent={handleCurrent} />
        );
      });

    else if (this.state.diff)
      currentView = <PictureDiff
                      toggleDiff={handleDiff}
                      photo={this.state.current} />;

    else
      currentView = <PictureDetail
                      photo={this.props.photos[this.state.current]}
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
