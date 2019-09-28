import React from 'react'
import classnames from 'classnames'

import { PhotoWork } from 'common/CommonTypes'

import { CameraMetrics } from 'app/renderer/CameraMetrics'
import { transformRect } from 'app/util/GeometryUtil'

import CropOverlay from './CropOverlay'
import { bindMany } from 'common/util/LangUtil'


export interface Props {
    className?: any
    photoWork: PhotoWork
    cameraMetrics: CameraMetrics
    onPhotoWorkChange(photoWork: PhotoWork): void
}

export default class CropModeLayer extends React.Component<Props> {

    constructor(props: Props) {
        super(props)
        bindMany(this, 'onTiltChange')
        this.state = {}
    }

    private onTiltChange(tilt: number) {
        const { props } = this
        const photoWork = { ...props.photoWork }
        if (tilt === 0) {
            delete photoWork.tilt
        } else {
            photoWork.tilt = tilt
        }
        props.onPhotoWorkChange(photoWork)
    }

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
                tilt={props.photoWork.tilt || 0}
                onCornerDrag={() => {}}
                onTiltChange={this.onTiltChange}
            />
        )
    }

}
