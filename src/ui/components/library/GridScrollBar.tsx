import React from 'react'
import { findDOMNode } from 'react-dom'
import classnames from 'classnames'

import { PhotoSectionId, PhotoSectionById } from 'common/models/Photo'
import { bindMany } from 'common/util/LangUtil'

import { GridLayout, GridSectionLayout } from 'ui/UITypes'

import { sectionHeadHeight } from './GridSection'

import './GridScrollBar.less'


export interface Props {
    className?: any
    gridLayout: GridLayout
    sectionIds: PhotoSectionId[]
    sectionById: PhotoSectionById
    viewportHeight: number
    contentHeight: number
    scrollTop: number
    setScrollTop(scrollTop: number): void
}

interface State {
    isMouseInside: boolean
    isDragging: boolean
    mouseOverHint: { y: number, label: string }
}

export default class GridScrollBar extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props)
        this.state = { isMouseInside: false, isDragging: false, mouseOverHint: { y: 0, label: '' } }
        bindMany(this, 'onMouseDown', 'onWindowMouseMove', 'onWindowMouseUp', 'onMouseMove', 'onMouseOut')
    }

    private onMouseDown(event: React.MouseEvent) {
        const nextState: Partial<State> = { isDragging: true }
        this.moveHint(event.clientY, nextState, true)
        window.addEventListener('mousemove', this.onWindowMouseMove)
        window.addEventListener('mouseup', this.onWindowMouseUp)
        this.setState(nextState as any)
    }

    private onWindowMouseMove(event: MouseEvent) {
        const nextState: Partial<State> = {}
        this.moveHint(event.clientY, nextState, true)
        this.setState(nextState as any)
    }

    private onWindowMouseUp() {
        window.removeEventListener('mousemove', this.onWindowMouseMove)
        window.removeEventListener('mouseup', this.onWindowMouseUp)
        this.setState({ isDragging: false })
    }

    private onMouseMove(event: React.MouseEvent) {
        const nextState: Partial<State> = { isMouseInside: true }
        this.moveHint(event.clientY, nextState)
        this.setState(nextState as any)
    }

    private onMouseOut(event: React.MouseEvent) {
        const mainElem = findDOMNode(this.refs.main) as HTMLDivElement

        let elem: HTMLElement | null = event.relatedTarget as HTMLElement
        while (elem) {
            if (elem === mainElem) {
                // Mouse didn't leave the mainElem
                return
            }
            elem = elem.parentElement
        }

        this.setState({ isMouseInside: false })
    }

    private moveHint(clientY: number, nextState: Partial<State>, scrollToHint?: boolean) {
        const { props, state } = this

        const mainElem = findDOMNode(this.refs.main) as HTMLDivElement
        const mainRect = mainElem.getBoundingClientRect()

        const y = clientY - mainRect.top
        const prevMouseOverHint = state.mouseOverHint
        const contentY = Math.round(props.contentHeight * y / props.viewportHeight)
        if (!prevMouseOverHint || y !== prevMouseOverHint.y) {
            const sectionIndex = getSectionIndexAtY(contentY, props.gridLayout.sectionLayouts)
            const section = (sectionIndex !== null) && props.sectionById[props.sectionIds[sectionIndex]]
            const label = section ? section.title : ''

            nextState.mouseOverHint = { y, label }
        }
        if (scrollToHint) {
            props.setScrollTop(contentY)
        }
    }

    render() {
        const { props, state } = this
        const scrollHeight = Math.max(1, props.viewportHeight, props.contentHeight)
        return (
            <div
                ref='main'
                className={classnames(props.className, 'GridScrollBar')}
                onMouseDown={this.onMouseDown}
                onMouseMove={this.onMouseMove}
                onMouseOut={this.onMouseOut}
            >
                <div
                    className='GridScrollBar-thumb'
                    style={{
                        top: Math.round(props.viewportHeight * props.scrollTop / scrollHeight),
                        height: Math.min(4, Math.round(props.viewportHeight * props.viewportHeight / scrollHeight))
                    }}
                />
                <div
                    className={classnames('GridScrollBar-hint', { isVisible: state.isMouseInside || state.isDragging })}
                    style={{ top: state.mouseOverHint.y }}
                >
                    <div className={classnames('GridScrollBar-hintLabel', { isBelow: state.mouseOverHint.y < 30 })}>
                        {state.mouseOverHint.label}
                    </div>
                </div>
            </div>
        )
    }

}


function getSectionIndexAtY(y: number, sectionLayouts: GridSectionLayout[]): number | null {
    let left = 0
    let right = sectionLayouts.length - 1
    while (left <= right) {
        let center = Math.floor(left + (right - left) / 2)
        const sectionLayout = sectionLayouts[center]
        if (y < sectionLayout.sectionTop) {
            right = center - 1
        } else if (y > sectionLayout.sectionTop + sectionHeadHeight + sectionLayout.containerHeight) {
            left = center + 1
        } else {
            return center
        }
    }
    return null
}
