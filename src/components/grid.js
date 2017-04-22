import React from 'react';
import { connect } from 'react-redux';

import keymapManager from './../keymap-manager';
import Picture from './picture';

class Grid extends React.Component {
  static propTypes = {
    setExport: React.PropTypes.func.isRequired,
    setScrollTop: React.PropTypes.func.isRequired,
    highlighted: React.PropTypes.array.isRequired,
    current: React.PropTypes.number,
    actions: React.PropTypes.object.isRequired,
    photos: React.PropTypes.array.isRequired
  }

  constructor(props) {
    super(props);

    this.pressedEnter = this.pressedEnter.bind(this);
  }

  handleFlagging() {
    let flagSet = this.props.photos
      .filter((photo, i) => this.state.highlighted.indexOf(i) !== -1);

    this.props.actions.flagSet(this.props.photos, flagSet, true);
  }

  pressedEnter() {
    if (this.props.highlighted.length === 1)
      this.props.actions.setCurrent(this.props.highlighted[0]);
  }

  componentDidMount() {
    window.addEventListener('grid:left', this.props.actions.moveHighlightLeft);
    window.addEventListener('grid:right', this.props.actions.moveHighlightRight);
    window.addEventListener('grid:up', this.props.actions.moveHighlightUp);
    window.addEventListener('grid:down', this.props.actions.moveHighlightDown);
    window.addEventListener('grid:enter', this.pressedEnter);

    keymapManager.bind(this.refs.grid);
  }

  componentWillUnmount() {
    window.removeEventListener('grid:left', this.props.actions.moveHighlightLeft);
    window.removeEventListener('grid:right', this.props.actions.moveHighlightRight);
    window.removeEventListener('grid:up', this.props.actions.moveHighlightUp);
    window.removeEventListener('grid:down', this.props.actions.moveHighlightDown);
    window.removeEventListener('grid:enter', this.pressedEnter);

    keymapManager.unbind();
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
            setExport={this.props.setExport} />
          )
        }
      </div>
    );
  }
}

const ReduxGrid = connect(state => ({
  current: state.current,
  highlighted: state.highlighted
}))(Grid);

export default ReduxGrid;
