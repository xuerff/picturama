import { remote } from 'electron'
import * as classNames from 'classnames'
import * as React from 'react'
import { findDOMNode } from 'react-dom'
import { Spinner } from '@blueprintjs/core'

import { PhotoId, PhotoType } from '../../../common/models/Photo'
import CancelablePromise, { isCancelError } from '../../../common/util/CancelablePromise'
import { bindMany } from '../../../common/util/LangUtil'

import { isMac } from '../../UiConstants'
import FaIcon from '../widget/icon/FaIcon'

const { Menu, MenuItem } = remote


interface Props {
    photo: PhotoType
    isHighlighted: boolean
    getThumbnailPath: (photo: PhotoType) => CancelablePromise<string>
    setDetailPhotoById: (photoId: PhotoId) => void
    openExport: () => void
    setHighlightedFlagged: () => void
    togglePhotoHighlighted: (photoId: PhotoId, highlighted: boolean) => void
    setHighlightedPhoto: (photoId: PhotoId) => void
}

interface State {
    showContextMenu: boolean
    thumbnailPath: string | null
}

export default class Picture extends React.Component<Props, State> {

    private menu: Electron.Menu | null = null
    private runningThumbnailPathPromise: CancelablePromise<void> | null = null

    constructor(props) {
        super(props)

        this.state = { showContextMenu: false, thumbnailPath: null }

        bindMany(this, 'contextMenu', 'onAfterRender', 'positionFlag', 'handleClick', 'handleDblClick', 'onThumnailChange')
    }

    contextMenu(e: React.MouseEvent<HTMLImageElement>) {
        e.preventDefault()

        if (!this.props.isHighlighted) {
            this.props.togglePhotoHighlighted(this.props.photo.id, true)
        }

        this.setState({ showContextMenu: true })
    }

    componentDidMount() {
        this.menu = new Menu()

        this.menu.append(new MenuItem({
            label: 'Flag picture(s)',
            click: this.props.setHighlightedFlagged
        }))

        this.menu.append(new MenuItem({
            label: 'Export picture(s)',
            click: this.props.openExport
        }))

        window.addEventListener('edit:thumnailChange', this.onThumnailChange)
        this.updateThumbnail()
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
        const props = this.props

        if (props.photo.id != prevProps.photo.id) {
            this.setState({ thumbnailPath: null })
            this.updateThumbnail()
        }

        if (props.isHighlighted) {
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

        if (this.state.showContextMenu && props.isHighlighted) {
            // If no timeout the menu will appears before the highlight
            setTimeout(() => this.menu.popup({}))

            this.setState({ showContextMenu: false })
        }
    }

    componentWillUnmount() {
        window.removeEventListener('edit:thumnailChange', this.onThumnailChange)
        if (this.runningThumbnailPathPromise) {
            this.runningThumbnailPathPromise.cancel()
            this.runningThumbnailPathPromise = null
        }
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
            this.updateThumbnail()
        }
    }

    updateThumbnail() {
        if (this.runningThumbnailPathPromise) {
            this.runningThumbnailPathPromise.cancel()
        }

        this.runningThumbnailPathPromise = this.props.getThumbnailPath(this.props.photo)
            .then(thumbnailPath => this.setState({ thumbnailPath }))
            .catch(error => {
                if (!isCancelError(error)) {
                    // TODO: Show error in UI
                    console.error('Getting thumbnail failed', error)
                }
            })
    }

    handleDblClick() {
        this.props.setDetailPhotoById(this.props.photo.id)
    }

    handleClick(e: React.MouseEvent<HTMLImageElement>) {
        e.preventDefault()

        if (isMac ? e.metaKey : e.ctrlKey) {
            this.props.togglePhotoHighlighted(this.props.photo.id, !this.props.isHighlighted)
        } else {
            this.props.setHighlightedPhoto(this.props.photo.id)
        }
    }

    render() {
        const props = this.props
        const thumbnailPath = this.state.thumbnailPath
        const showFlag = !! (thumbnailPath && props.photo.flag)

        if (showFlag) {
            setTimeout(this.onAfterRender)
        }
        return (
            <a
                ref="picture"
                className={classNames('Picture', { isHighlighted: this.props.isHighlighted })}
                onDoubleClick={this.handleDblClick}>
                <span className="v-align"></span>
                {!thumbnailPath &&
                    <Spinner />
                }
                {thumbnailPath &&
                    <img
                        ref="image"
                        onClick={this.handleClick}
                        onContextMenu={this.contextMenu}
                        src={thumbnailPath}
                        className="shadow--2dp" />
                }
                {showFlag &&
                    <FaIcon ref="flag" className="Picture-flag" name="flag"/>
                }
            </a>
        )
    }
}
