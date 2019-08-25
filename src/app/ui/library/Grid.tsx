import classNames from 'classnames'
import React from 'react'
import { findDOMNode } from 'react-dom'
import { ResizeSensor, IResizeEntry } from '@blueprintjs/core'

import { PhotoId, Photo, PhotoSectionId, PhotoSectionById, isLoadedPhotoSection } from 'common/CommonTypes'
import CancelablePromise from 'common/util/CancelablePromise'
import { bindMany, cloneArrayWithItemRemoved } from 'common/util/LangUtil'

import { isMac } from 'app/UiConstants'
import { GridSectionLayout, GridLayout } from 'app/UITypes'
import { CommandGroupId, addCommandGroup, setCommandGroupEnabled, removeCommandGroup } from 'app/controller/HotkeyController'
import { gridScrollBarWidth } from 'app/style/variables'
import { getScrollbarSize } from 'app/util/DomUtil'

import GridScrollBar from './GridScrollBar'
import GridSection, { sectionHeadHeight } from './GridSection'

import './Grid.less'


const gridSpacerHeight = 1

export type GetGridLayoutFunction = (
    sectionIds: PhotoSectionId[], sectionById: PhotoSectionById, scrollTop: number, viewportWidth: number, viewportHeight: number,
    gridRowHeight: number, nailedSectionId: PhotoSectionId | null)
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
    getThumbnailSrc: (photo: Photo) => string
    createThumbnail: (sectionId: PhotoSectionId, photo: Photo) => CancelablePromise<string>
    setSelectedPhotos: (sectionId: PhotoSectionId, photoIds: PhotoId[]) => void
    setDetailPhotoById: (sectionId: PhotoSectionId, photoId: PhotoId) => void
}

interface State {
    scrollTop: number
    viewportWidth: number
    viewportHeight: number
}

export default class Grid extends React.Component<Props, State> {

    private commandGroupId: CommandGroupId

    private gridLayout: GridLayout | null = null
    private nailedSectionId: PhotoSectionId | null = null
    private releaseNailTimer: NodeJS.Timer | null = null


    constructor(props: Props) {
        super(props)

        this.state = { scrollTop: 0, viewportWidth: 0, viewportHeight: 0 }

        bindMany(this, 'onPhotoClick', 'onPhotoDoubleClick', 'onEnter', 'onResize', 'onScroll',
            'scrollToNailedSection', 'setScrollTop',  'moveHighlightLeft', 'moveHighlightRight', 'moveHighlightUp',
            'moveHighlightDown')
    }

    componentDidMount() {
        this.commandGroupId = addCommandGroup([
            { combo: 'left', onAction: this.moveHighlightLeft },
            { combo: 'right', onAction: this.moveHighlightRight },
            { combo: 'up', onAction: this.moveHighlightUp },
            { combo: 'down', onAction: this.moveHighlightDown },
            { combo: 'enter', onAction: this.onEnter },
        ])
    }

    shouldComponentUpdate(nextProps: Props, nextState: State, nextContext: any): boolean {
        const prevProps = this.props
        const prevState = this.state
        const prevGridLayout = this.gridLayout

        if (nextProps.isActive !== prevProps.isActive) {
            setCommandGroupEnabled(this.commandGroupId, nextProps.isActive)
        }

        if (nextProps.gridRowHeight !== prevProps.gridRowHeight || nextState.viewportWidth !== prevState.viewportWidth ||
            nextProps.sectionIds !== prevProps.sectionIds)
        {
            // Sizes have changed or content has changed (e.g. during import)
            // -> Nail the current section (Change the scroll position, so the same section is shown again)
            if (prevGridLayout) {
                const nailedSectionIndex = getSectionIndexAtY(prevState.scrollTop, prevState.viewportHeight, prevGridLayout.sectionLayouts)
                this.nailedSectionId = nailedSectionIndex == null ? null : prevProps.sectionIds[nailedSectionIndex]
            }
        
            if (this.releaseNailTimer) {
                clearTimeout(this.releaseNailTimer)
            }
            this.releaseNailTimer = setTimeout(() => {
                this.nailedSectionId = null
            }, 1000)
        }

        this.gridLayout = this.getGridLayout(nextProps, nextState)

        return this.gridLayout !== prevGridLayout
            || nextProps.selectedSectionId !== prevProps.selectedSectionId
            || nextProps.selectedPhotoIds !== prevProps.selectedPhotoIds
            || nextState.scrollTop !== prevState.scrollTop
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
        if (this.nailedSectionId !== null) {
            this.scrollToNailedSection()
        }
    }

    componentWillUnmount() {
        removeCommandGroup(this.commandGroupId)
    }

    private getGridLayout(props: Props, state: State): GridLayout {
        return props.getGridLayout(props.sectionIds, props.sectionById, state.scrollTop,
            state.viewportWidth - gridScrollBarWidth, state.viewportHeight,
            props.gridRowHeight, this.nailedSectionId)
    }

    private onPhotoClick(event: React.MouseEvent, sectionId: PhotoSectionId, photoId: PhotoId) {
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

    private onPhotoDoubleClick(event: React.MouseEvent, sectionId: PhotoSectionId, photoId: PhotoId) {
        this.props.setDetailPhotoById(sectionId, photoId)
    }

    private onEnter() {
        const props = this.props
        if (props.selectedSectionId && props.selectedPhotoIds.length === 1) {
            props.setDetailPhotoById(props.selectedSectionId, props.selectedPhotoIds[0])
        }
    }

    private onResize(entries: IResizeEntry[]) {
        const contentRect = entries[0].contentRect
        this.setState({ viewportWidth: contentRect.width, viewportHeight: contentRect.height })
    }

    private onScroll(event: any) {
        const scrollPaneElem = findDOMNode(this.refs.scrollPane) as HTMLElement
        this.setState({ scrollTop: scrollPaneElem.scrollTop })
    }

    private scrollToNailedSection() {
        if (this.nailedSectionId === null || !this.gridLayout) {
            return
        }

        let nextScrollTop: number | null = null
        const nailedSectionIndex = this.props.sectionIds.indexOf(this.nailedSectionId)
        if (nailedSectionIndex !== -1) {
            const layout = this.gridLayout.sectionLayouts[nailedSectionIndex]
            if (layout) {
                nextScrollTop = layout.sectionTop
            }
        }

        this.nailedSectionId = null
        if (nextScrollTop !== null && nextScrollTop !== this.state.scrollTop) {
            this.setScrollTop(nextScrollTop)
        }
    }

    private setScrollTop(scrollTop: number) {
        scrollTop = Math.round(scrollTop)
        if (scrollTop !== this.state.scrollTop) {
            const scrollPaneElem = findDOMNode(this.refs.scrollPane) as HTMLElement
            scrollPaneElem.scrollTop = scrollTop
        }
    }

    private moveHighlightLeft() {
        this.moveHighlight('left')
    }

    private moveHighlightRight() {
        this.moveHighlight('right')
    }

    private moveHighlightUp() {
        this.moveHighlight('up')
    }

    private moveHighlightDown() {
        this.moveHighlight('down')
    }

    private moveHighlight(move: 'left' | 'right' | 'up' | 'down') {
        const { props } = this
        const { selectedSectionId } = props

        if (!selectedSectionId) {
            return
        }

        const selectedSection = props.sectionById[selectedSectionId]
        if (!isLoadedPhotoSection(selectedSection)) {
            return
        }

        let currentPhotoIndex = selectedSection.photoIds.indexOf(props.selectedPhotoIds[0])

        let nextPhotoIndex = currentPhotoIndex
        if (move === 'left' || move === 'right') {
            nextPhotoIndex = currentPhotoIndex + (move === 'left' ? -1 : 1)
        } else if (this.gridLayout) {
            const selectedSectionIndex = props.sectionIds.indexOf(selectedSectionId)
            const sectionLayout = this.gridLayout.sectionLayouts[selectedSectionIndex]
            if (sectionLayout && sectionLayout.boxes) {
                const currentPhotoBox = sectionLayout.boxes[currentPhotoIndex]
                if (currentPhotoBox) {
                    const currentPhotoCenterX = currentPhotoBox.left + currentPhotoBox.width / 2
                    const moveUp = move === 'up'
                    let prevRowTopY = -1
                    let bestBoxCenterXDiff = Number.POSITIVE_INFINITY
                    for (let boxIndex = currentPhotoIndex + (moveUp ? -1 : 1); moveUp ? boxIndex >= 0 : boxIndex < sectionLayout.boxes.length; moveUp ? boxIndex-- : boxIndex++) {
                        const box = sectionLayout.boxes[boxIndex]
                        if (box.top !== currentPhotoBox.top) {
                            if (prevRowTopY === -1) {
                                prevRowTopY = box.top
                            } else if (box.top !== prevRowTopY) {
                                // We are one row to far
                                break
                            }

                            const boxCenterX = box.left + box.width / 2
                            const boxCenterXDiff = Math.abs(currentPhotoCenterX - boxCenterX)
                            if (boxCenterXDiff < bestBoxCenterXDiff) {
                                bestBoxCenterXDiff = boxCenterXDiff
                                nextPhotoIndex = boxIndex
                            }
                        }
                    }
                }
            }
        }

        const nextPhotoId = selectedSection.photoIds[nextPhotoIndex]
        if (nextPhotoId) {
            props.setSelectedPhotos(selectedSection.id, [ nextPhotoId ])
        }
    }

    private renderVisibleSections() {
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

    private calculateContentHeight(): number {
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

        if (!this.gridLayout) {
            // This is the first call of `render`
            this.gridLayout = this.getGridLayout(props, state)
        }

        const contentHeight = this.calculateContentHeight()
        const scrollbarWidth = getScrollbarSize().width

        return (
            <ResizeSensor onResize={this.onResize}>
                <div className={classNames(props.className, 'Grid')}>
                    <div ref='scrollPane' className='Grid-scrollPane' style={{ right: `-${scrollbarWidth}px` }} onScroll={this.onScroll}>
                        {this.renderVisibleSections()}
                        {!!contentHeight &&
                            <div className='Grid-spacer' style={{ top: contentHeight - gridSpacerHeight }} />
                        }
                    </div>
                    {gridLayout && props.sectionIds.length > 0 &&
                        <GridScrollBar
                            className='Grid-scrollBar'
                            gridLayout={gridLayout!}
                            sectionIds={props.sectionIds}
                            sectionById={props.sectionById}
                            viewportHeight={state.viewportHeight}
                            contentHeight={contentHeight}
                            scrollTop={state.scrollTop}
                            setScrollTop={this.setScrollTop}
                        />
                    }
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
