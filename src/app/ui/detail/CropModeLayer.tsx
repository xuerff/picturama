import React from 'react'
import classnames from 'classnames'

import { CameraMetrics } from 'app/renderer/CameraMetrics'
import { transformRect } from 'app/util/GeometryUtil'

import CropOverlay from './CropOverlay'


export interface Props {
    className?: any
    cameraMetrics: CameraMetrics
}

export default class CropModeLayer extends React.Component<Props> {

    render() {
        const { props } = this
        const { cameraMetrics } = props
        if (!cameraMetrics) {
            return null
        }

        const cropRectInViewCoords = transformRect(cameraMetrics.cropRect, cameraMetrics.cameraMatrix)

        return (
            <CropOverlay
                className={classnames(props.className, 'CropModeLayer')}
                width={cameraMetrics.canvasSize.width}
                height={cameraMetrics.canvasSize.height}
                rect={cropRectInViewCoords}
                tilt={0}
                onCornerDrag={() => {}}
                onTiltChange={() => {}}
            />
        )
    }

}
