import classNames from 'classnames'
import React from 'react'
import { findDOMNode } from 'react-dom'
import { ResizeSensor, IResizeEntry } from '@blueprintjs/core'

import { PhotoId, PhotoType, PhotoSectionId, PhotoSectionById } from '../../../common/models/Photo'
import CancelablePromise from '../../../common/util/CancelablePromise'
import { bindMany, cloneArrayWithItemRemoved } from '../../../common/util/LangUtil'

import keymapManager from '../../keymap-manager'
import { isMac } from '../../UiConstants'
import { GridSectionLayout } from '../../UITypes'
import GridSection from './GridSection'

import './Grid.less'


export type LayoutForSectionsFunction = (
    sectionIds: PhotoSectionId[], sectionById: PhotoSectionById, scrollTop: number, viewportWidth: number, viewportHeight: number)
    => GridSectionLayout[]

interface Props {
    className?: any
    isActive: boolean
    sectionIds: PhotoSectionId[]
    sectionById: PhotoSectionById
    selectedSectionId: PhotoSectionId
    selectedPhotoIds: PhotoId[]
    getLayoutForSections: LayoutForSectionsFunction
    getThumbnailSrc: (photo: PhotoType) => string
    createThumbnail: (photo: PhotoType) => CancelablePromise<string>
    setSelectedPhotos: (sectionId: PhotoSectionId, photoIds: PhotoId[]) => void
    setDetailPhotoById: (sectionId: PhotoSectionId, photoId: PhotoId) => void
}

interface State {
    scrollTop: number
    viewportWidth: number
    viewportHeight: number
}

export default class Grid extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props)

        this.state = { scrollTop: 0, viewportWidth: 0, viewportHeight: 0 }

        bindMany(this, 'onPhotoClick', 'onPhotoDoubleClick', 'pressedEnter', 'onResize', 'onScroll',
            'moveHighlightLeft', 'moveHighlightRight', 'moveHighlightUp', 'moveHighlightDown')
    }

    componentDidMount() {
        this.addListeners()
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
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

    onPhotoClick(event: React.MouseEvent, sectionId: PhotoSectionId, photoId: PhotoId) {
        const props = this.props

        event.preventDefault()

        if (sectionId === props.selectedSectionId && isMac ? event.metaKey : event.ctrlKey) {
            const photoIndex = props.selectedPhotoIds.indexOf(photoId)
            const highlight = props.selectedPhotoIds && photoIndex === -1
            if (highlight) {
                if (photoIndex === -1) {
                    props.setSelectedPhotos(sectionId, [ ...props.selectedPhotoIds, photoId ])
                }
            } else {
                props.setSelectedPhotos(sectionId, cloneArrayWithItemRemoved(props.selectedPhotoIds, photoId))
            }
        } else {
            props.setSelectedPhotos(sectionId, [ photoId ])
        }
    }

    onPhotoDoubleClick(event: React.MouseEvent, sectionId: PhotoSectionId, photoId: PhotoId) {
        this.props.setDetailPhotoById(sectionId, photoId)
    }

    pressedEnter() {
        const props = this.props
        if (props.selectedPhotoIds.length === 1) {
            props.setDetailPhotoById(props.selectedSectionId, props.selectedPhotoIds[0])
        }
    }

    onResize(entries: IResizeEntry[]) {
        const contentRect = entries[0].contentRect
        this.setState({ viewportWidth: contentRect.width, viewportHeight: contentRect.height })
    }

    onScroll() {
        const gridElem = findDOMNode(this.refs.grid) as HTMLElement
        this.setState({ scrollTop: gridElem.scrollTop })
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
        const props = this.props
        const selectedSection = props.sectionById[props.selectedSectionId]
        if (!selectedSection) {
            return
        }

        let currentIndex = selectedSection.photoIds.indexOf(props.selectedPhotoIds[0])

        const gridElem = findDOMNode(this.refs.grid) as HTMLElement
        const gridWidth = gridElem.getBoundingClientRect().width
        const pictureWidth = gridElem.children[0].getBoundingClientRect().width
        const columnCount = Math.floor(gridWidth / pictureWidth)

        const newHighlightedIndex = currentIndex + x + y * columnCount
        const newHighlightedPhotoId = selectedSection.photoIds[newHighlightedIndex]
        if (newHighlightedPhotoId) {
            props.setSelectedPhotos(selectedSection.id, [ newHighlightedPhotoId ])
        }
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
        const state = this.state
        const sectionLayouts = props.getLayoutForSections(props.sectionIds, props.sectionById, state.scrollTop, state.viewportWidth, state.viewportHeight)

        return (
            <ResizeSensor onResize={this.onResize}>
                <div ref="grid" className={classNames(props.className, 'Grid')} onScroll={this.onScroll}>
                    {props.sectionIds.map((sectionId, sectionIndex) =>
                        <GridSection
                            key={sectionId}
                            section={props.sectionById[sectionId]}
                            layout={sectionLayouts[sectionIndex]}
                            selectedPhotoIds={props.selectedPhotoIds}
                            getThumbnailSrc={props.getThumbnailSrc}
                            createThumbnail={props.createThumbnail}
                            onPhotoClick={this.onPhotoClick}
                            onPhotoDoubleClick={this.onPhotoDoubleClick}
                        />
                    )}
                </div>
            </ResizeSensor>
        )
    }
}
