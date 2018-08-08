import * as classNames from 'classnames'
import * as React from 'react'

export interface Props {
    className?: any
    style?: any
    children?: any
    size?: number | string
    width?: number | string
    height?: number | string
    color?: string
    viewBox?: string
}

/**
 * Base class for SVG icons
 */
export default class SvgIcon extends React.Component<Props, undefined> {
    static defaultProps: Partial<Props> = {
        color: 'currentColor'
    }

    render() {
        const props = this.props
        const size = props.size || '1em'
        return (
            <svg
                className={classNames(props.className, 'SvgIcon')}
                style={{ verticalAlign: 'middle', ...props.style}}
                width={props.width || size}
                height={props.height || size}
                fill={props.color}
                viewBox={props.viewBox}
                preserveAspectRatio='xMidYMid meet'
            >
                {props.children}
            </svg>
        )
    }
}
