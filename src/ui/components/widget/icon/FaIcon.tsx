import classNames from 'classnames'
import React from 'react'

interface Props {
    className?: any
    style?: any
    name: string
}

/**
 * Shows a [Font Awesome Icon](https://fontawesome.com/icons).
 */
export default class FaIcon extends React.Component<Props, undefined> {
    render() {
        const props = this.props
        return (
            <i
                className={classNames(props.className, `FaIcon fa fa-${props.name}`)}
                style={props.style}
            />
        )
    }
}
