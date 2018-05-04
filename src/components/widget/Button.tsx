import * as classNames from 'classnames'
import * as React from 'react'

interface Props {
    className?: any
    style?: any
    children?: any
    type?: 'default' | 'primary'
    enabled?: boolean
    onClick?: (evt) => void
    tip?: string
}

class Button extends React.Component<Props, undefined> {
    static defaultProps: Partial<Props> = {
        type: 'default',
        enabled: true
    }

    constructor(props) {
        super(props)

        this.onClick = this.onClick.bind(this)
    }

    onClick(evt) {
        const props = this.props
        if (props.enabled) {
            props.onClick(evt)
        }
    }

    render() {
        const props = this.props
        let dynamicAttributes: any = {}
        if (!props.enabled) {
            dynamicAttributes.disabled = 'disabled'
        }

        return (
            <div
                className={classNames(props.className, `Button hasType-${props.type}`)}
                style={props.style}
                onClick={this.onClick}
                aria-label={props.tip}
                title={props.tip}
                {...dynamicAttributes}
            >
                {props.children}
            </div>
        )
    }
}

export default Button
