import React from 'react';
import { connect } from 'react-redux';

import Picture from './picture';

class Grid extends React.Component {
  static propTypes = {
    highlighted: React.PropTypes.array.isRequired,
    setCurrent: React.PropTypes.func.isRequired,
    actions: React.PropTypes.object.isRequired,
    photos: React.PropTypes.array.isRequired
  }

  constructor(props) {
    super(props);

    this.moveHighlightUp = this.moveHighlightUp.bind(this);
    this.moveHighlightDown = this.moveHighlightDown.bind(this);
    this.moveHighlightRight = this.moveHighlightRight.bind(this);
  }

  handleFlagging() {
    let flagSet = this.props.photos
      .filter((photo, i) => this.state.highlighted.indexOf(i) !== -1);

    this.props.actions.flagSet(this.props.photos, flagSet, true);
  }

  handleExport() {
    this.unbindEventListeners();
    let state = this.state;

    state.modal = 'export';
    state.photosToExport = this.props.photos
      .filter((photo, i) => this.state.highlighted.indexOf(i) !== -1);

    this.setState(state);
  }

  moveHighlightRight() {
    let state = this.state;
    let currentPos = this.state.highlighted[0];

    if (currentPos + 1 < this.props.photos.length)
      state.highlighted = [ currentPos + 1 ];

    this.setState(state);
  }

  moveHighlightUp(e) {
    e.preventDefault();

    let state = this.state;
    let currentPos = this.state.highlighted[0];
    let gridWidth = this.refs.grid.getBoundingClientRect().width;
    let elWidth = this.refs.grid.children[0].getBoundingClientRect().width;
    let jumpSize = gridWidth / elWidth;

    if (currentPos - jumpSize > 0)
      state.highlighted = [ currentPos - jumpSize ];

    this.setState(state);
  }

  moveHighlightDown(e) {
    e.preventDefault();

    let state = this.state;
    let currentPos = this.state.highlighted[0];
    let gridWidth = this.refs.grid.getBoundingClientRect().width;
    let elWidth = this.refs.grid.children[0].getBoundingClientRect().width;
    let jumpSize = gridWidth / elWidth;

    if (currentPos + jumpSize < this.props.photos.length)
      state.highlighted = [ currentPos + jumpSize ];

    this.setState(state);
  }

  componentDidMount() {
    window.addEventListener('library:left', this.props.actions.moveHighlightLeft);
    window.addEventListener('library:right', this.moveHighlightRight);
    window.addEventListener('library:up', this.moveHighlightUp);
    window.addEventListener('library:down', this.moveHighlightDown);
  }

  componentWillUnmount() {
    window.removeEventListener('library:left', this.moveHighlightLeft);
    window.removeEventListener('library:right', this.moveHighlightRight);
    window.removeEventListener('library:up', this.moveHighlightUp);
    window.removeEventListener('library:down', this.moveHighlightDown);
  }

  render() {
    return (
      <div className="grid" ref="grid">
        {this.props.photos.map((photo, index) =>
          <Picture
            key={index}
            index={index}
            photo={photo}
            actions={this.props.actions}
            setFlagging={this.handleFlagging.bind(this)}
            setExport={this.handleExport.bind(this)}
            setCurrent={this.props.setCurrent.bind(this)} />
          )
        }
      </div>
    );
  }
}

const ReduxGrid = connect(state => ({
  highlighted: state.highlighted
}))(Grid);

export default ReduxGrid;
