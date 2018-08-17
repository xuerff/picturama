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
import GridSection, { sectionHeadHeight } from './GridSection'

import './Grid.less'


export type LayoutForSectionsFunction = (
    sectionIds: PhotoSectionId[], sectionById: PhotoSectionById, scrollTop: number, viewportWidth: number, viewportHeight: number,
    gridRowHeight: number, nailedSectionIndex: number | null)
    => GridSectionLayout[]

interface Props {
    className?: any
    isActive: boolean
    sectionIds: PhotoSectionId[]
    sectionById: PhotoSectionById
    selectedSectionId: PhotoSectionId
    selectedPhotoIds: PhotoId[]
    gridRowHeight: number
    getLayoutForSections: LayoutForSectionsFunction
    getThumbnailSrc: (photo: PhotoType) => string
    createThumbnail: (sectionId: PhotoSectionId, photo: PhotoType) => CancelablePromise<string>
    setSelectedPhotos: (sectionId: PhotoSectionId, photoIds: PhotoId[]) => void
    setDetailPhotoById: (sectionId: PhotoSectionId, photoId: PhotoId) => void
}

interface State {
    viewportWidth: number
    viewportHeight: number
}

interface Snapshot {
}

export default class Grid extends React.Component<Props, State, Snapshot> {

    private scrollTop = 0
    private prevSectionLayouts: GridSectionLayout[] | null = null
    private nailedSectionIndex: number | null = null
    private releaseNailTimer: NodeJS.Timer | null = null


    constructor(props: Props) {
        super(props)

        this.state = { viewportWidth: 0, viewportHeight: 0 }

        bindMany(this, 'onPhotoClick', 'onPhotoDoubleClick', 'pressedEnter', 'onResize', 'onScroll', 'scrollToNailedSection',
            'moveHighlightLeft', 'moveHighlightRight', 'moveHighlightUp', 'moveHighlightDown')
    }

    componentDidMount() {
        this.addListeners()
    }

    shouldComponentUpdate(nextProps: Props, nextState: State, nextContext: any): boolean {
        const props = this.props
        const state = this.state
        if (nextProps.gridRowHeight !== props.gridRowHeight || nextState.viewportWidth !== state.viewportWidth) {
            // Sizes have changed
            // -> Nail the current section (Change the scroll position, so the same section is shown again)
            if (this.nailedSectionIndex === null && this.prevSectionLayouts) {
                this.nailedSectionIndex = getSectionIndexAtY(this.scrollTop, state.viewportHeight, this.prevSectionLayouts)
            }
            clearTimeout(this.releaseNailTimer)
            this.releaseNailTimer = setTimeout(() => {
                this.nailedSectionIndex = null
            }, 1000)
        }

        return true
    }

    componentDidUpdate(prevProps: Props, prevState: State, snapshot: Snapshot) {
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

    onScroll(event: any) {
        const gridElem = findDOMNode(this.refs.grid) as HTMLElement
        this.scrollTop = gridElem.scrollTop
        if (this.nailedSectionIndex === null) {
            this.forceUpdate()
        }
    }

    scrollToNailedSection() {
        if (this.nailedSectionIndex === null || !this.prevSectionLayouts) {
            return
        }

        const layout = this.prevSectionLayouts[this.nailedSectionIndex]
        if (!layout) {
            return
        }

        const scrollTop = layout.sectionTop
        if (scrollTop !== this.scrollTop) {
            const gridElem = findDOMNode(this.refs.grid) as HTMLElement
            gridElem.scrollTop = scrollTop
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
        const sectionLayouts = props.getLayoutForSections(props.sectionIds, props.sectionById, this.scrollTop, state.viewportWidth, state.viewportHeight,
            props.gridRowHeight, this.nailedSectionIndex)
        this.prevSectionLayouts = sectionLayouts

        if (this.nailedSectionIndex !== null) {
            setTimeout(this.scrollToNailedSection)
        }

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


function getSectionIndexAtY(y: number, viewportHeight: number, sectionLayouts: GridSectionLayout[]): number | null {
    for (let sectionIndex = 0, sectionCount = sectionLayouts.length; sectionIndex < sectionCount; sectionIndex++) {
        const layout = sectionLayouts[sectionIndex]
        const sectionBottom = layout.sectionTop + sectionHeadHeight + layout.containerHeight
        if (layout.sectionTop >= y || sectionBottom >= y + viewportHeight) {
            return sectionIndex
        }
    }
    return null
}
