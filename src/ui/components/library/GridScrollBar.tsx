import React from 'react'
import classnames from 'classnames'

import { GridLayout } from 'ui/UITypes'

import './GridScrollBar.less'


export interface Props {
    className?: any
    gridLayout: GridLayout
    viewportHeight: number
    contentHeight: number
    scrollTop: number
}

export default class GridScrollBar extends React.Component<Props> {

    render() {
        const props = this.props
        const scrollHeight = Math.max(1, props.viewportHeight, props.contentHeight)
        return (
            <div className={classnames(props.className, 'GridScrollBar')}>
                <div
                    className='GridScrollBar-thumb'
                    style={{
                        top: Math.round(props.viewportHeight * props.scrollTop / scrollHeight),
                        height: Math.round(props.viewportHeight * props.viewportHeight / scrollHeight)
                    }}
                />
            </div>
        )
    }

}
