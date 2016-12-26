import { remote } from 'electron';
import classNames from 'classnames';
import React from 'react';

const {Menu, MenuItem} = remote;

var rotation = {};
rotation[1] = '';
rotation[0] = 'minus-ninety';

class Picture extends React.Component {
  static propTypes = {
    setCurrent: React.PropTypes.func.isRequired,
    setHighlight: React.PropTypes.func.isRequired,
    setFlagging: React.PropTypes.func.isRequired,
    setExport: React.PropTypes.func.isRequired,
    highlighted: React.PropTypes.bool.isRequired,
    photo: React.PropTypes.object.isRequired,
    index: React.PropTypes.number.isRequired
  }

  constructor(props) {
    super(props);

    this.state = { showContextMenu: false };

    this.contextMenu = this.contextMenu.bind(this);
  }

  contextMenu(e) {
    let state = this.state;

    e.preventDefault();

    if (!this.props.highlighted)
      this.props.setHighlight(this.props.index, e.ctrlKey);

    state.showContextMenu = true;

    this.setState(state);
  }

  componentDidMount() {
    this.menu = new Menu();

    this.menu.append(new MenuItem({ 
      label: 'Flag picture(s)', 
      click: this.props.setFlagging
    }));

    this.menu.append(new MenuItem({ 
      label: 'Export picture(s)', 
      click: this.props.setExport
    }));
  }

  componentDidUpdate() {
    let state = this.state;

    if (this.props.highlighted) {
      let rect = this.refs.picture.getBoundingClientRect();
      let container = this.refs.picture.parentNode.parentNode;
      let containerRect = container.getBoundingClientRect();

      if (rect.bottom > containerRect.bottom)
        container.scrollTop += rect.bottom - containerRect.bottom;
      else if (rect.top < 0) 
        container.scrollTop += rect.top;
    }

    if (this.state.showContextMenu && this.props.highlighted) {
      // If no timeout the menu will appears before the highlight
      setTimeout(() => this.menu.popup(remote.getCurrentWindow()), 10);
      state.showContextMenu = false;

      this.setState(state);
    }
  }

  handleDblClick() {
    this.props.setCurrent(this.props.index);
  }

  handleClick(e) {
    e.preventDefault();
    this.props.setHighlight(this.props.index, e.ctrlKey);
  }

  render() {
    let photo = this.props.photo;

    let anchorClass = classNames(
      'picture',
      'card',
      { 'highlighted': this.props.highlighted }
    );

    let imgClass = classNames(
      rotation[photo.orientation],
      'shadow--2dp'
    );

    return (
      <a
        ref="picture"
        className={anchorClass}
        onDoubleClick={this.handleDblClick.bind(this)}>
        <span className="v-align"></span>
        <img
          onClick={this.handleClick.bind(this)}
          onContextMenu={this.contextMenu}
          src={photo.thumb_250} 
          className={imgClass} />
      </a>
    );
  }
}

export default Picture;
