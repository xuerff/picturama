import { remote } from 'electron';
import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';

import Picture from './picture';
import PictureDetail from './picture-detail';
import PictureDiff from './picture-diff';

const {Menu, MenuItem} = remote;

class Library extends React.Component {
  static propTypes = {
    setScrollTop: React.PropTypes.func.isRequired,
    actions: React.PropTypes.object.isRequired,
    current: React.PropTypes.number,
    diff: React.PropTypes.bool.isRequired,
    photos: React.PropTypes.array.isRequired
  }

  constructor(props) {
    super(props);
    this.contextMenu = this.contextMenu.bind(this);
    this.state = { highlighted: [], scrollTop: 0 };
  }

  contextMenu(e) {
    e.preventDefault();
    this.menu.popup(remote.getCurrentWindow());
  }

  handleCurrent(current) {
    let state = this.state;

    this.props.actions.setCurrent(current);

    if (this.props.current != -1)
      state.scrollTop = ReactDOM
        .findDOMNode(this)
        .parentNode
        .scrollTop;

    this.setState(state);
  }

  handleFlagging() {
    console.log('flag it!', this.state.highlighted);
  }

  componentDidUpdate() {
    let state = this.state;

    if (this.props.current == -1 && state.scrollTop > 0) {
      this.props.setScrollTop(state.scrollTop);
      state.scrollTop = 0;
      this.setState(state);
    }
  }

  componentDidMount() {
    this.props.actions.getPhotos();

    this.menu = new Menu();

    this.menu.append(new MenuItem({ 
      label: 'Flag picture(s)', 
      click: this.handleFlagging.bind(this)
    }));

    document.addEventListener('contextmenu', this.contextMenu);
  }

  componentWillUnmount() {
    document.removeEventListener('contextmenu', this.contextMenu);
  }

  isLast() {
    let photos = this.props.photos;

    if (photos.length == photos.indexOf(this.props.current) + 1)
      return true;
    else if (photos.indexOf(this.props.current) == 0)
      return true;
    else
      return false;
  }

  handleFlag() {
    this.props.actions.toggleFlag(this.props.photos[this.props.current]);
  }

  handleHighlight(index, ctrlKey) {
    let state = this.state;

    if (!ctrlKey)
      state.highlighted = [];

    state.highlighted.push(index);

    this.setState(state);
  }

  render() {
    let currentView;
    console.log('current', this.props.current);

    if (!this.props.photos || this.props.photos.length === 0)
      currentView = <div>No photos imported. press Ctrl+R to start scanning</div>;

    else if (this.props.current == -1)
      currentView = this.props.photos.map((photo, index) => {
        return (
          <Picture
            key={index}
            index={index}
            photo={photo}
            setHighlight={this.handleHighlight.bind(this)}
            highlighted={this.state.highlighted.indexOf(index) != -1}
            setCurrent={this.handleCurrent.bind(this)} />
        );
      });

    else if (this.props.diff)
      currentView = <PictureDiff
                      actions={this.props.actions}
                      photo={this.props.photos[this.props.current]} />;

    else
      currentView = <PictureDetail
                      photo={this.props.photos[this.props.current]}
                      actions={this.props.actions}
                      toggleFlag={this.handleFlag.bind(this)}
                      setCurrent={this.handleCurrent.bind(this)}
                      isLast={this.isLast.bind(this)} />;

    return (
      <div id="library">
        {currentView}
      </div>
    );
  }
}

const ReduxLibrary = connect(state => ({
  photos: state.photos,
  current: state.current,
  diff: state.diff
}))(Library);

export default ReduxLibrary;
