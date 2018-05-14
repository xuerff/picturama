import { remote } from 'electron';
import * as classNames from 'classnames'
import * as React from 'react'
import { connect } from 'react-redux';
import { findDOMNode } from 'react-dom'

import AppState from '../../reducers/AppState'
import { PhotoType } from '../../models/photo'
import { bindMany } from '../../util/LangUtil'

const { Menu, MenuItem } = remote;

let rotation = {};

rotation[1] = '';
rotation[0] = 'minus-ninety';


interface ConnectProps {
    actions: any
    setFlagging: () => void
    photo: PhotoType
    photoIndex: number
}

interface Props extends ConnectProps {
     highlighted: number[]
}

interface State {
    showContextMenu: boolean
    thumbnailVersion: number
}

class Picture extends React.Component<Props, State> {

  private menu: Electron.Menu | null = null

  constructor(props) {
    super(props);

    this.state = { showContextMenu: false, thumbnailVersion: Date.now() }

    bindMany(this, 'contextMenu', 'handleClick', 'handleDblClick', 'onThumnailChange')
  }

  contextMenu(e: React.MouseEvent<HTMLImageElement>) {
    e.preventDefault();

    if (!this.props.highlighted)
      this.props.actions.setHighlight(this.props.photoIndex, e.ctrlKey, e.metaKey)

    this.setState({ showContextMenu: true })
  }

  componentDidMount() {
    this.menu = new Menu();

    this.menu.append(new MenuItem({
      label: 'Flag picture(s)',
      click: this.props.setFlagging
    }));

    this.menu.append(new MenuItem({
      label: 'Export picture(s)',
      click: this.props.actions.openExport
    }));

    window.addEventListener('edit:thumnailChange', this.onThumnailChange)
  }

  componentDidUpdate() {
    let state = this.state;

    if (this.props.highlighted.indexOf(this.props.photoIndex) !== -1) {
      const pictureElem = findDOMNode(this.refs.picture)
      let rect = pictureElem.getBoundingClientRect()
      let containerElem = pictureElem.parentNode.parentNode.parentNode as Element
      let containerRect = containerElem.getBoundingClientRect()

      if (rect.bottom > containerRect.bottom) {
        containerElem.scrollTop += rect.bottom - containerRect.bottom
      } else if (rect.top < 0) {
        containerElem.scrollTop += rect.top
      }
    }

    if (this.state.showContextMenu && this.props.highlighted) {
      // If no timeout the menu will appears before the highlight
      setTimeout(() => this.menu.popup(remote.getCurrentWindow()), 10);

      this.setState({ showContextMenu: false })
    }
  }

  componentWillUnmount() {
    window.removeEventListener('edit:thumnailChange', this.onThumnailChange)
  }

  onThumnailChange(evt: CustomEvent) {
    const photoId = evt.detail.photoId
    if (photoId === this.props.photo.id) {
      this.setState({ thumbnailVersion: Date.now() })
    }
  }

  handleDblClick() {
    this.props.actions.setCurrent(this.props.photoIndex);
  }

  handleClick(e: React.MouseEvent<HTMLImageElement>) {
    e.preventDefault();

    this.props.actions.setHighlight(this.props.photoIndex, e.ctrlKey, e.metaKey)
  }

  render() {
    let photo = this.props.photo;

    let anchorClass = classNames(
      'picture',
      'card',
      { highlighted: this.props.highlighted.indexOf(this.props.photoIndex) !== -1 }
    );

    let imgClass = classNames(
      rotation[photo.orientation],
      'shadow--2dp'
    );

    return (
      <a
        ref="picture"
        className={anchorClass}
        onDoubleClick={this.handleDblClick}>
        <span className="v-align"></span>
        <img
          onClick={this.handleClick}
          onContextMenu={this.contextMenu}
          src={photo.thumb_250 + '?v=' + this.state.thumbnailVersion}
          className={imgClass} />
      </a>
    );
  }
}

const ReduxPicture = connect<Props, {}, ConnectProps, AppState>((state, props) => ({
     ...props,
    highlighted: state.highlighted
}))(Picture)

export default ReduxPicture;
