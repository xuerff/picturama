import { remote } from 'electron';
import * as classNames from 'classnames'
import * as React from 'react'
import { connect } from 'react-redux';
import { findDOMNode } from 'react-dom'

import AppState from '../../reducers/AppState'
import { PhotoType } from '../../models/photo'
import { bindMany } from '../../util/LangUtil'
import FaIcon from '../widget/icon/FaIcon'

const { Menu, MenuItem } = remote;


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

    bindMany(this, 'contextMenu', 'onAfterRender', 'positionFlag', 'handleClick', 'handleDblClick', 'onThumnailChange')
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
      const pictureElem = findDOMNode(this.refs.picture) as HTMLElement
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
      setTimeout(() => this.menu.popup({}))

      this.setState({ showContextMenu: false })
    }
  }

  componentWillUnmount() {
    window.removeEventListener('edit:thumnailChange', this.onThumnailChange)
  }

  onAfterRender() {
    if (this.refs.flag) {
      const imageElem = findDOMNode(this.refs.image) as HTMLImageElement & { _loadAdded: boolean }
      if (imageElem.complete) {
        this.positionFlag()
      } else if (!imageElem._loadAdded) {
        imageElem.addEventListener('load', this.positionFlag)
        imageElem._loadAdded = true
      }
    }
  }

  positionFlag() {
    if (this.refs.flag) {
      const pictureElem = findDOMNode(this.refs.picture) as HTMLElement
      const imageElem = findDOMNode(this.refs.image) as HTMLImageElement
      const flagElem = findDOMNode(this.refs.flag) as HTMLElement

      flagElem.style.display = 'block'
      flagElem.style.right  = `${Math.round((pictureElem.offsetWidth  - imageElem.offsetWidth ) / 2)}px`
      flagElem.style.bottom = `${Math.round((pictureElem.offsetHeight - imageElem.offsetHeight) / 2)}px`
    }
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
    setTimeout(this.onAfterRender)
    return (
      <a
        ref="picture"
        className={classNames('Picture', { isHighlighted: this.props.highlighted.indexOf(this.props.photoIndex) !== -1 })}
        onDoubleClick={this.handleDblClick}>
        <span className="v-align"></span>
        <img
          ref="image"
          onClick={this.handleClick}
          onContextMenu={this.contextMenu}
          src={photo.thumb_250 + '?v=' + this.state.thumbnailVersion}
          className="shadow--2dp" />
        {!!photo.flag &&
          <FaIcon ref="flag" className="Picture-flag" name="flag"/>
        }
      </a>
    );
  }
}

const ReduxPicture = connect<Props, {}, ConnectProps, AppState>((state, props) => ({
     ...props,
    highlighted: state.highlighted
}))(Picture)

export default ReduxPicture;
