import React from 'react'
import { findDOMNode } from 'react-dom'
import classnames from 'classnames'

import { bindMany } from 'common/util/LangUtil'

import './Toolbar.less'


interface Props {
    id?: string
    className?: any
    style?: any
    children?: any
    isTopBar?: boolean
    isLeft?: boolean
    onBackgroundDoubleClick?: React.MouseEventHandler<HTMLElement>
}

class Toolbar extends React.Component<Props> {

    static defaultProps: Partial<Props> = {
        isTopBar: true,
        isLeft: false
    }

    constructor(props: Props) {
        super(props)
        bindMany(this, 'onDoubleClick')
    }

    private onDoubleClick(event: React.MouseEvent<HTMLElement>) {
        if (this.props.onBackgroundDoubleClick && event.target === findDOMNode(this.refs.main)) {
            this.props.onBackgroundDoubleClick(event)
        }
    }

    render() {
        const props = this.props
        return (
            <div
                ref='main'
                id={props.id}
                className={classnames(props.className, 'Toolbar bp3-dark', { isTopBar: props.isTopBar, isLeft: props.isLeft })}
                style={props.style}
                onDoubleClick={this.onDoubleClick}
            >
                {props.children}
            </div>
        )
    }
}

export default Toolbar
