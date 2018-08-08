import * as classNames from 'classnames'
import * as React from 'react'

interface Props {
    className?: any
    style?: any
    children?: any
}

class ButtonGroup extends React.Component<Props, undefined> {
    render() {
        const props = this.props
        return (
            <div
                className={classNames(props.className, 'ButtonGroup')}
                style={props.style}
            >
                {props.children}
            </div>
        )
    }
}

export default ButtonGroup
