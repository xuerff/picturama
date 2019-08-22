import classNames from 'classnames'
import React from 'react'

import './SvgIcon.less'


export const SVG_ICON_CLASS = 'SvgIcon'

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
export default class SvgIcon extends React.Component<Props> {
    static defaultProps: Partial<Props> = {
        color: 'currentColor'
    }

    render() {
        const props = this.props
        const size = props.size || '1em'
        return (
            <svg
                className={classNames(props.className, SVG_ICON_CLASS)}
                style={props.style}
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
