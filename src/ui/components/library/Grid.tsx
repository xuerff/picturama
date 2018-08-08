import * as React from 'react'
import { findDOMNode } from 'react-dom'

import keymapManager from '../../keymap-manager'
import { PhotoId, PhotoType } from '../../../common/models/Photo'
import { PhotoData } from '../../state/reducers/library'
import CancelablePromise from '../../../common/util/CancelablePromise'
import { bindMany, cloneArrayWithItemRemoved } from '../../../common/util/LangUtil'
import Picture from './Picture'


interface Props {
    isActive: boolean
    photos: PhotoData
    photoIds: PhotoId[]
    highlightedPhotoIds: PhotoId[]
    getThumbnailPath: (photo: PhotoType) => CancelablePromise<string>
    setHighlightedPhotos: (highlightedIds: PhotoId[]) => void
    setDetailPhotoById: (photoId: PhotoId) => void
    openExport: () => void
    setPhotosFlagged: (photos: PhotoType[], flag: boolean) => void
}

export default class Grid extends React.Component<Props, undefined> {

    constructor(props) {
        super(props);

        bindMany(this, 'setHighlightedFlagged', 'pressedEnter', 'moveHighlightLeft', 'moveHighlightRight', 'moveHighlightUp', 'moveHighlightDown', 'togglePhotoHighlighted', 'setHighlightedPhoto')
    }

    componentDidMount() {
        this.addListeners()
    }

    componentDidUpdate(prevProps, prevState) {
        const props = this.props
        if (props.isActive !== prevProps.isActive) {
            if (props.isActive) {
                this.addListeners()
            } else {
                this.removeListeners()
            }
        }
    }

    componentWillUnmount() {
        this.removeListeners()
    }

    setHighlightedFlagged() {
        const highlightedPhotos = this.props.highlightedPhotoIds.map(photoId => this.props.photos[photoId])
        this.props.setPhotosFlagged(highlightedPhotos, true)
    }

    pressedEnter() {
        if (this.props.highlightedPhotoIds.length === 1) {
            this.props.setDetailPhotoById(this.props.highlightedPhotoIds[0])
        }
    }

    moveHighlightLeft() {
        this.moveHighlight(-1, 0)
    }

    moveHighlightRight() {
        this.moveHighlight(1, 0)
    }

    moveHighlightUp() {
        this.moveHighlight(0, -1)
    }

    moveHighlightDown() {
        this.moveHighlight(0, 1)
    }

    moveHighlight(x: number, y: number) {
        let currentIndex = this.props.photoIds.indexOf(this.props.highlightedPhotoIds[0])

        const gridElem = findDOMNode(this.refs.grid) as HTMLElement
        const gridWidth = gridElem.getBoundingClientRect().width
        const pictureWidth = gridElem.children[0].getBoundingClientRect().width
        const columnCount = Math.floor(gridWidth / pictureWidth)

        const newHighlightedIndex = currentIndex + x + y * columnCount
        const newHighlightedPhotoId = this.props.photoIds[newHighlightedIndex]
        if (newHighlightedPhotoId) {
            this.props.setHighlightedPhotos([ newHighlightedPhotoId ])
        }
    }

    togglePhotoHighlighted(photoId: PhotoId, highlighted: boolean) {
        if (highlighted) {
            if (this.props.highlightedPhotoIds.indexOf(photoId) === -1) {
                this.props.setHighlightedPhotos([ ...this.props.highlightedPhotoIds, photoId ])
            }
        } else {
            this.props.setHighlightedPhotos(cloneArrayWithItemRemoved(this.props.highlightedPhotoIds, photoId))
        }
    }

    setHighlightedPhoto(photoId: PhotoId) {
        this.props.setHighlightedPhotos([ photoId ])
    }

    addListeners() {
        window.addEventListener('grid:left', this.moveHighlightLeft)
        window.addEventListener('grid:right', this.moveHighlightRight)
        window.addEventListener('grid:up', this.moveHighlightUp)
        window.addEventListener('grid:down', this.moveHighlightDown)
        window.addEventListener('grid:enter', this.pressedEnter)

        keymapManager.bind(this.refs.grid)
    }

    removeListeners() {
        window.removeEventListener('grid:left', this.moveHighlightLeft)
        window.removeEventListener('grid:right', this.moveHighlightRight)
        window.removeEventListener('grid:up', this.moveHighlightUp)
        window.removeEventListener('grid:down', this.moveHighlightDown)
        window.removeEventListener('grid:enter', this.pressedEnter)

        keymapManager.unbind()
    }

    render() {
        const props = this.props
        return (
            <div className="Grid" ref="grid">
                {props.photoIds.map(photoId =>
                    <Picture
                        key={photoId}
                        photo={props.photos[photoId]}
                        isHighlighted={props.highlightedPhotoIds.indexOf(photoId) !== -1}
                        getThumbnailPath={props.getThumbnailPath}
                        setDetailPhotoById={props.setDetailPhotoById}
                        openExport={props.openExport}
                        setHighlightedFlagged={this.setHighlightedFlagged}
                        togglePhotoHighlighted={this.togglePhotoHighlighted}
                        setHighlightedPhoto={this.setHighlightedPhoto}
                    />
                )}
            </div>
        );
    }
}
