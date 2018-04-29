import { remote } from 'electron';
import * as classNames from 'classnames'
import * as React from 'react'
import { connect } from 'react-redux';
import * as PropTypes from 'prop-types'

const { Menu, MenuItem } = remote;

let rotation = {};

rotation[1] = '';
rotation[0] = 'minus-ninety';

class Picture extends React.Component {
  static propTypes = {
    actions: PropTypes.object.isRequired,
    setFlagging: PropTypes.func.isRequired,
    setExport: PropTypes.func.isRequired,
    highlighted: PropTypes.array.isRequired,
    photo: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired
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
      this.props.actions.setHighlight(this.props.index, e.ctrlKey);

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

    if (this.props.highlighted.indexOf(this.props.index) !== -1) {
      let rect = this.refs.picture.getBoundingClientRect();
      let container = this.refs.picture.parentNode.parentNode.parentNode;
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
    this.props.actions.setCurrent(this.props.index);
  }

  handleClick(e) {
    e.preventDefault();

    this.props.actions.setHighlight(this.props.index, e.ctrlKey);
  }

  render() {
    let photo = this.props.photo;

    let anchorClass = classNames(
      'picture',
      'card',
      { highlighted: this.props.highlighted.indexOf(this.props.index) !== -1 }
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

const ReduxPicture = connect(state => ({
  highlighted: state.highlighted
}))(Picture);

export default ReduxPicture;
