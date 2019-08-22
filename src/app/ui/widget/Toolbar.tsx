import classNames from 'classnames'
import React from 'react'

import './Toolbar.less'


interface Props {
    id?: string
    className?: any
    style?: any
    children?: any
    isTopBar?: boolean
    isLeft?: boolean
}

class Toolbar extends React.Component<Props> {
    static defaultProps: Partial<Props> = {
        isTopBar: true,
        isLeft: false
    }

    render() {
        const props = this.props
        return (
            <div
                id={props.id}
                className={classNames(props.className, 'Toolbar bp3-dark', { isTopBar: props.isTopBar, isLeft: props.isLeft })}
                style={props.style}
            >
                {props.children}
            </div>
        )
    }
}

export default Toolbar
