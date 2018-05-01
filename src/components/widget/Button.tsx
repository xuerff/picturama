import * as classNames from 'classnames'
import * as React from 'react'

interface Props {
    id?: string
    className?: any
    style?: any
    type?: 'default' | 'primary'
    onClick?: (evt) => void
    children?: any
}

class Button extends React.Component<Props, undefined> {
    static defaultProps: Partial<Props> = {
        type: 'default'
    }

    render() {
        const props = this.props
        return (
            <div
                id={props.id}
                className={classNames(props.className, `Button hasType-${props.type}`)}
                style={props.style}
                onClick={props.onClick}
            >
                {props.children}
            </div>
        )
    }
}

export default Button
