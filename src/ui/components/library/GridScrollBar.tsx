import React from 'react'
import { findDOMNode } from 'react-dom'
import classnames from 'classnames'

import { bindMany } from 'common/util/LangUtil'

import { GridLayout } from 'ui/UITypes'

import './GridScrollBar.less'


export interface Props {
    className?: any
    gridLayout: GridLayout
    viewportHeight: number
    contentHeight: number
    scrollTop: number
}

interface State {
    mouseOverHint: { y: number, visible: boolean }
}

export default class GridScrollBar extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props)
        this.state = { mouseOverHint: { y: 0, visible: false } }
        bindMany(this, 'onMouseMove', 'onMouseOut')
    }

    private onMouseMove(event: React.MouseEvent) {
        const mainElem = findDOMNode(this.refs.main) as HTMLDivElement
        const mainRect = mainElem.getBoundingClientRect()

        const y = event.clientY - mainRect.top
        const prevMouseOverHint = this.state.mouseOverHint
        if (!prevMouseOverHint || y !== prevMouseOverHint.y) {
            this.setState({ mouseOverHint: { y, visible: true } })
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
                    className={classnames(props.className, 'GridScrollBar-hint', { isVisible: state.mouseOverHint.visible })}
                    style={{ top: state.mouseOverHint.y }}
                />
            </div>
        )
    }

}
