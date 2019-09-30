import React from 'react'
import classnames from 'classnames'

import { PhotoWork } from 'common/CommonTypes'

import { CameraMetrics, getInvertedCameraMatrix } from 'app/renderer/CameraMetrics'
import { Point, Corner } from 'app/util/GeometryTypes'
import { transformRect, transformPoint, getCornerPointOfRect, oppositeCorner, getRectFromPoints, roundPoint } from 'app/util/GeometryUtil'

import CropOverlay from './CropOverlay'
import { bindMany, isShallowEqual } from 'common/util/LangUtil'
import CropModeToolbar from './CropModeToolbar'


export interface Props {
    topBarClassName: string
    bodyClassName: string
    photoWork: PhotoWork
    cameraMetrics: CameraMetrics
    onPhotoWorkEdited(photoWork: PhotoWork): void
    onDone(): void
}

export default class CropModeLayer extends React.Component<Props> {

    constructor(props: Props) {
        super(props)
        bindMany(this, 'onCornerDrag', 'onTiltChange')
    }

    private onCornerDrag(corner: Corner, point: Point, isFinished: boolean) {
        const { props } = this
        const { cameraMetrics } = props

        const invertedCameraMatrix = getInvertedCameraMatrix(cameraMetrics)
        const pointInProjectedCoordinates = roundPoint(transformPoint(point, invertedCameraMatrix))
        const oppositePoint = getCornerPointOfRect(cameraMetrics.cropRect, oppositeCorner[corner])

        const cropRect = getRectFromPoints(pointInProjectedCoordinates, oppositePoint)

        const photoWork = { ...props.photoWork }
        if (isShallowEqual(cropRect, cameraMetrics.neutralCropRect)) {
            delete photoWork.cropRect
        } else {
            photoWork.cropRect = cropRect
        }
        props.onPhotoWorkEdited(photoWork)
    }

    private onTiltChange(tilt: number) {
        const { props } = this
        const photoWork = { ...props.photoWork }
        if (tilt === 0) {
            delete photoWork.tilt
        } else {
            photoWork.tilt = tilt
        }
        props.onPhotoWorkEdited(photoWork)
    }

    render() {
        const { props } = this
        const { cameraMetrics } = props
        if (!cameraMetrics) {
            return null
        }

        const cropRectInViewCoords = transformRect(cameraMetrics.cropRect, cameraMetrics.cameraMatrix)

        return (
            <>
                <CropModeToolbar
                    className={classnames(props.topBarClassName, 'CropModeLayer-toolbar')}
                    photoWork={props.photoWork}
                    onPhotoWorkEdited={props.onPhotoWorkEdited}
                    onDone={props.onDone}
                />
                <CropOverlay
                    className={classnames(props.bodyClassName, 'CropModeLayer-body')}
                    width={cameraMetrics.canvasSize.width}
                    height={cameraMetrics.canvasSize.height}
                    rect={cropRectInViewCoords}
                    tilt={props.photoWork.tilt || 0}
                    onCornerDrag={this.onCornerDrag}
                    onTiltChange={this.onTiltChange}
                />
            </>
        )
    }

}
