import React from 'react'
import classnames from 'classnames'

import { Rect } from 'app/UITypes'

import './CropOverlay.less'


const borderWidth = 1
const edgeWidth = 3
const edgeSize = 20

const edgePaths = {
    leftTop: `m${-edgeWidth/2},${edgeSize - edgeWidth/2} l0,${-edgeSize} l${edgeSize},0`,
    rightTop: `m${-edgeSize + edgeWidth/2},${-edgeWidth/2} l${edgeSize},0 l0,${edgeSize}`,
    leftBottom: `m${-edgeWidth/2},${-edgeSize + edgeWidth/2} l0,${edgeSize} l${edgeSize},0`,
    rightBottom: `m${-edgeSize + edgeWidth/2},${edgeWidth/2} l${edgeSize},0 l0,${-edgeSize}`,
}

export interface Props {
    className?: any
    width: number
    height: number
    rect: Rect
}

export default class CropOverlay extends React.Component<Props> {

    render() {
        const { props } = this
        const { width, height, rect } = props
        if (!width || !height) {
            return null
        }
        return (
            <svg
                className={classnames(props.className, 'CropOverlay')}
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
            >
                <path
                    className='CropOverlay-dim'
                    fillRule='evenodd'
                    d={`M0,0 l${width},0 l0,${height} l${-width},0 z M${rect.x},${rect.y} l0,${rect.height} l${rect.width},0 l0,${-rect.height} z`}
                />
                <rect
                    className='CropOverlay-border'
                    x={rect.x - borderWidth / 2}
                    y={rect.y - borderWidth / 2}
                    width={rect.width + borderWidth}
                    height={rect.height + borderWidth}
                    strokeWidth={borderWidth}
                />
                <g transform={`translate(${rect.x},${rect.y})`}>
                    <path className='CropOverlay-edge' strokeWidth={edgeWidth} d={edgePaths.leftTop} />
                </g>
                <g transform={`translate(${rect.x + rect.width},${rect.y})`}>
                    <path className='CropOverlay-edge' strokeWidth={edgeWidth} d={edgePaths.rightTop} />
                </g>
                <g transform={`translate(${rect.x},${rect.y + rect.height})`}>
                    <path className='CropOverlay-edge' strokeWidth={edgeWidth} d={edgePaths.leftBottom} />
                </g>
                <g transform={`translate(${rect.x + rect.width},${rect.y + rect.height})`}>
                    <path className='CropOverlay-edge' strokeWidth={edgeWidth} d={edgePaths.rightBottom} />
                </g>
            </svg>
        )
    }

}
