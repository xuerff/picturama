import classNames from 'classnames'
import React from 'react'
import { findDOMNode } from 'react-dom'
import { ResizeSensor, IResizeEntry } from '@blueprintjs/core'

import { PhotoId, PhotoType, PhotoSectionId, PhotoSectionById } from 'common/models/Photo'
import CancelablePromise from 'common/util/CancelablePromise'
import { bindMany, cloneArrayWithItemRemoved } from 'common/util/LangUtil'

import keymapManager from 'ui/keymap-manager'
import { isMac } from 'ui/UiConstants'
import { GridSectionLayout, GridLayout } from 'ui/UITypes'
import { gridScrollBarWidth } from 'ui/style/variables'
import { getScrollbarSize } from 'ui/util/DomUtil'

import GridScrollBar from './GridScrollBar'
import GridSection, { sectionHeadHeight } from './GridSection'

import './Grid.less'


const gridSpacerHeight = 1

export type GetGridLayoutFunction = (
    sectionIds: PhotoSectionId[], sectionById: PhotoSectionById, scrollTop: number, viewportWidth: number, viewportHeight: number,
    gridRowHeight: number, nailedSectionIndex: number | null)
    => GridLayout

interface Props {
    className?: any
    isActive: boolean
    sectionIds: PhotoSectionId[]
    sectionById: PhotoSectionById
    selectedSectionId: PhotoSectionId | null
    selectedPhotoIds: PhotoId[]
    gridRowHeight: number
    getGridLayout: GetGridLayoutFunction
    getThumbnailSrc: (photo: PhotoType) => string
    createThumbnail: (sectionId: PhotoSectionId, photo: PhotoType) => CancelablePromise<string>
    setSelectedPhotos: (sectionId: PhotoSectionId, photoIds: PhotoId[]) => void
    setDetailPhotoById: (sectionId: PhotoSectionId, photoId: PhotoId) => void
}

interface State {
    scrollTop: number
    viewportWidth: number
    viewportHeight: number
}

interface Snapshot {
}

export default class Grid extends React.Component<Props, State, Snapshot> {

    private gridLayout: GridLayout | null = null
    private nailedSectionIndex: number | null = null
    private releaseNailTimer: NodeJS.Timer | null = null


    constructor(props: Props) {
        super(props)

        this.state = { scrollTop: 0, viewportWidth: 0, viewportHeight: 0 }

        bindMany(this, 'onPhotoClick', 'onPhotoDoubleClick', 'pressedEnter', 'onResize', 'onScroll', 'scrollToNailedSection',
            'moveHighlightLeft', 'moveHighlightRight', 'moveHighlightUp', 'moveHighlightDown')
    }

    componentDidMount() {
        this.addListeners()

        this.gridLayout = this.getGridLayout(this.props, this.state)
    }

    shouldComponentUpdate(nextProps: Props, nextState: State, nextContext: any): boolean {
        const prevProps = this.props
        const prevState = this.state
        const prevGridLayout = this.gridLayout

        if (nextProps.gridRowHeight !== prevProps.gridRowHeight || nextState.viewportWidth !== prevState.viewportWidth) {
            // Sizes have changed
            // -> Nail the current section (Change the scroll position, so the same section is shown again)
            if (this.nailedSectionIndex === null && prevGridLayout) {
                this.nailedSectionIndex = getSectionIndexAtY(prevState.scrollTop, prevState.viewportHeight, prevGridLayout.sectionLayouts)
            }

            if (this.releaseNailTimer) {
                clearTimeout(this.releaseNailTimer)
            }
            this.releaseNailTimer = setTimeout(() => {
                this.nailedSectionIndex = null
            }, 1000)
        }

        this.gridLayout = this.getGridLayout(nextProps, nextState)

        return this.gridLayout !== prevGridLayout
            || nextProps.selectedSectionId !== prevProps.selectedSectionId
            || nextProps.selectedPhotoIds !== prevProps.selectedPhotoIds
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

        if (this.nailedSectionIndex !== null) {
            this.scrollToNailedSection()
        }
    }

    componentWillUnmount() {
        this.removeListeners()
    }

    getGridLayout(props: Props, state: State): GridLayout {
        return props.getGridLayout(props.sectionIds, props.sectionById, state.scrollTop,
            state.viewportWidth - gridScrollBarWidth, state.viewportHeight,
            props.gridRowHeight, this.nailedSectionIndex)
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
        if (props.selectedSectionId && props.selectedPhotoIds.length === 1) {
            props.setDetailPhotoById(props.selectedSectionId, props.selectedPhotoIds[0])
        }
    }

    onResize(entries: IResizeEntry[]) {
        const contentRect = entries[0].contentRect
        this.setState({ viewportWidth: contentRect.width, viewportHeight: contentRect.height })
    }

    onScroll(event: any) {
        const scrollPaneElem = findDOMNode(this.refs.scrollPane) as HTMLElement
        this.setState({ scrollTop: scrollPaneElem.scrollTop })
    }

    scrollToNailedSection() {
        if (this.nailedSectionIndex === null || !this.gridLayout) {
            return
        }

        const layout = this.gridLayout.sectionLayouts[this.nailedSectionIndex]
        if (!layout) {
            return
        }

        const scrollTop = layout.sectionTop
        if (scrollTop !== this.state.scrollTop) {
            const scrollPaneElem = findDOMNode(this.refs.scrollPane) as HTMLElement
            scrollPaneElem.scrollTop = scrollTop
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
        const selectedSection = props.selectedSectionId && props.sectionById[props.selectedSectionId]
        if (!selectedSection || !selectedSection.photoIds) {
            return
        }

        let currentIndex = selectedSection.photoIds.indexOf(props.selectedPhotoIds[0])

        // TODO: This is complete non-sense since pictures are not in a fixed grid any more
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

    renderVisibleSections() {
        const { props, state, gridLayout } = this

        if (!gridLayout) {
            return
        }

        let result: JSX.Element[] = []
        for (let sectionIndex = gridLayout.fromSectionIndex; sectionIndex < gridLayout.toSectionIndex; sectionIndex++) {
            const sectionId = props.sectionIds[sectionIndex]
            const layout = gridLayout.sectionLayouts[sectionIndex]
            if (!layout) {
                // This should not happen, but in some rare cases it might happen (had it on 2018-09-02 after empty trash)
                // TODO: Show error in UI
                console.warn(`Expected to have a layout for section #${sectionIndex} (${sectionId})`)
                continue
            }
            result.push(
                <GridSection
                    key={sectionId}
                    className="Grid-section"
                    style={{ top: layout.sectionTop, width: state.viewportWidth, height: sectionHeadHeight + layout.containerHeight }}
                    section={props.sectionById[sectionId]}
                    layout={layout}
                    selectedPhotoIds={props.selectedPhotoIds}
                    getThumbnailSrc={props.getThumbnailSrc}
                    createThumbnail={props.createThumbnail}
                    onPhotoClick={this.onPhotoClick}
                    onPhotoDoubleClick={this.onPhotoDoubleClick}
                />
            )
        }
        return result
    }

    calculateContentHeight(): number {
        const { props, gridLayout } = this
        const sectionCount = props.sectionIds.length
        if (!gridLayout || sectionCount === 0) {
            return 0
        } else {
            const lastLayout = gridLayout.sectionLayouts[sectionCount - 1]
            return lastLayout.sectionTop + sectionHeadHeight + lastLayout.containerHeight
        }
    }

    render() {
        const { props, state, gridLayout } = this
        const contentHeight = this.calculateContentHeight()
        const scrollbarWidth = getScrollbarSize().width

        return (
            <ResizeSensor onResize={this.onResize}>
                <div className={classNames(props.className, 'Grid')}>
                    <div ref='scrollPane' className='Grid-scrollPane' style={{ right: `-${scrollbarWidth}px` }} onScroll={this.onScroll}>
                        {this.renderVisibleSections()}
                        {contentHeight &&
                            <div className='Grid-spacer' style={{ top: contentHeight - gridSpacerHeight }} />
                        }
                    </div>
                    <GridScrollBar
                        className='Grid-scrollBar'
                        gridLayout={gridLayout!}
                        viewportHeight={state.viewportHeight}
                        contentHeight={contentHeight}
                        scrollTop={state.scrollTop}
                    />
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
