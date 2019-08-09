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
}

interface State {
    mouseOverHint: { y: number, visible: boolean, label: string }
}

export default class GridScrollBar extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props)
        this.state = { mouseOverHint: { y: 0, visible: false, label: '' } }
        bindMany(this, 'onMouseMove', 'onMouseOut')
    }

    private onMouseMove(event: React.MouseEvent) {
        const { props, state } = this

        const mainElem = findDOMNode(this.refs.main) as HTMLDivElement
        const mainRect = mainElem.getBoundingClientRect()

        const y = event.clientY - mainRect.top
        const prevMouseOverHint = state.mouseOverHint
        if (!prevMouseOverHint || y !== prevMouseOverHint.y) {
            const contentY = props.contentHeight * y / props.viewportHeight

            const sectionIndex = getSectionIndexAtY(contentY, props.gridLayout.sectionLayouts)
            const section = (sectionIndex !== null) && props.sectionById[props.sectionIds[sectionIndex]]
            const label = section ? section.title : ''

            this.setState({ mouseOverHint: { y, visible: true, label } })
        }
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

        this.setState({ mouseOverHint: { ...this.state.mouseOverHint, visible: false } })
    }

    render() {
        const { props, state } = this
        const scrollHeight = Math.max(1, props.viewportHeight, props.contentHeight)
        return (
            <div
                ref='main'
                className={classnames(props.className, 'GridScrollBar')}
                onMouseMove={this.onMouseMove}
                onMouseOut={this.onMouseOut}
            >
                <div
                    className='GridScrollBar-thumb'
                    style={{
                        top: Math.round(props.viewportHeight * props.scrollTop / scrollHeight),
                        height: Math.round(props.viewportHeight * props.viewportHeight / scrollHeight)
                    }}
                />
                <div
                    className={classnames('GridScrollBar-hint', { isVisible: state.mouseOverHint.visible })}
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
