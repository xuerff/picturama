import { remote } from 'electron'
import classNames from 'classnames'
import React from 'react'
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
    getThumbnailSrc: (photo: PhotoType) => string
    createThumbnail: (photo: PhotoType) => CancelablePromise<string>
    setDetailPhotoById: (photoId: PhotoId) => void
    openExport: () => void
    setHighlightedFlagged: () => void
    togglePhotoHighlighted: (photoId: PhotoId, highlighted: boolean) => void
    setHighlightedPhoto: (photoId: PhotoId) => void
}

interface State {
    showContextMenu: boolean
    thumbnailSrc: string | null
    isThumbnailLoaded: boolean
}

export default class Picture extends React.Component<Props, State> {

    private menu: Electron.Menu | null = null
    private createThumbnailPromise: CancelablePromise<void> | null = null
    private delayedUpdateTimout: number | null = null

    constructor(props: Props) {
        super(props)

        this.state = {
            showContextMenu: false,
            thumbnailSrc: this.props.getThumbnailSrc(props.photo),
            isThumbnailLoaded: false
        }

        bindMany(this, 'contextMenu', 'onAfterRender', 'positionFlag', 'handleClick', 'handleDblClick', 'onThumnailChange', 'onThumbnailLoad', 'onThumbnailLoadError')
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
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
        const props = this.props

        if (props.photo.id != prevProps.photo.id) {
            window.clearTimeout(this.delayedUpdateTimout)
            if (this.createThumbnailPromise) {
                this.createThumbnailPromise.cancel()
                this.createThumbnailPromise = null
            }
            this.setState({ thumbnailSrc: this.props.getThumbnailSrc(this.props.photo), isThumbnailLoaded: false })
        }

        if (props.isHighlighted && props.isHighlighted !== prevProps.isHighlighted) {
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
        if (this.createThumbnailPromise) {
            window.clearTimeout(this.delayedUpdateTimout)
            this.createThumbnailPromise.cancel()
            this.createThumbnailPromise = null
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
            this.createThumbnail(true)
        }
    }

    onThumbnailLoad() {
        this.setState({ isThumbnailLoaded: true })
    }

    onThumbnailLoadError() {
        if (!this.createThumbnailPromise) {
            this.createThumbnail(false)
        }
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

    createThumbnail(delayUpdate: boolean) {
        window.clearTimeout(this.delayedUpdateTimout)
        if (delayUpdate) {
            this.delayedUpdateTimout = window.setTimeout(() => this.setState({ thumbnailSrc: null, isThumbnailLoaded: false }), 1000)
        } else {
            this.setState({ thumbnailSrc: null, isThumbnailLoaded: false })
        }

        this.createThumbnailPromise = this.props.createThumbnail(this.props.photo)
            .then(thumbnailSrc => {
                window.clearTimeout(this.delayedUpdateTimout)
                if (thumbnailSrc === this.state.thumbnailSrc) {
                    // Force loading the same image again
                    this.setState({ thumbnailSrc: null, isThumbnailLoaded: false })
                    window.setTimeout(() => this.setState({ thumbnailSrc }))
                } else {
                    this.setState({ thumbnailSrc, isThumbnailLoaded: false })
                }
            })
            .catch(error => {
                if (!isCancelError(error)) {
                    // TODO: Show error in UI
                    console.error('Getting thumbnail failed', error)
                }
            })
    }

    render() {
        // Wanted behaviour:
        // - If the photo changes, the thumbnail should load fast, so no spinner should be shown.
        // - If there is no thumbnail yet, we trigger creating the thumbnail and show a spinner.
        // - If the flagged state changes, the thumbnail should not flicker.
        // - If the photo is changed (e.g. rotated), the old thumbnail should stay until the new one is created.
        //   Only if creating the thumbnail takes a long time, a spinner should be shown.

        const props = this.props
        const state = this.state
        const showFlag = !!(props.photo.flag && state.isThumbnailLoaded)

        if (showFlag) {
            setTimeout(this.onAfterRender)
        }
        return (
            <a
                ref="picture"
                className={classNames('Picture', { isHighlighted: this.props.isHighlighted })}
                onDoubleClick={this.handleDblClick}>
                {state.thumbnailSrc &&
                    <img
                        ref="image"
                        className="Picture-thumbnail shadow--2dp"
                        src={state.thumbnailSrc}
                        onLoad={this.onThumbnailLoad}
                        onError={this.onThumbnailLoadError}
                        onClick={this.handleClick}
                        onContextMenu={this.contextMenu}
                    />
                }
                {showFlag &&
                    <FaIcon ref="flag" className="Picture-flag" name="flag"/>
                }
                {state.thumbnailSrc === null &&
                    <Spinner className="Picture-spinner" />
                }
            </a>
        )
    }
}
