import React from 'react'
import classnames from 'classnames'

import { PhotoWork } from 'common/CommonTypes'
import { vec2 } from 'gl-matrix'

import { CameraMetrics, getInvertedCameraMatrix } from 'app/renderer/CameraMetrics'
import { Point, Corner } from 'app/util/GeometryTypes'
import { transformRect, oppositeCorner, cutLineWithPolygon, cornerPointOfRect, toVec2,
    roundVec2, horizontalAdjacentCorner, verticalAdjacentCorner, isVectorInPolygon, Vec2Like, directionOfPoints, rectFromPoints } from 'app/util/GeometryUtil'

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
        const prevCropRect = cameraMetrics.cropRect

        const invertedCameraMatrix = getInvertedCameraMatrix(cameraMetrics)
        const projectedPoint = vec2.transformMat4(vec2.create(), toVec2(point), invertedCameraMatrix)
        const oppositePoint = cornerPointOfRect(prevCropRect, oppositeCorner[corner])

        // Limit the rect to the texture
        const texturePolygon = createTexturePolygon(cameraMetrics)
        let nextCornerPoint = limitPointToPolygon(projectedPoint, oppositePoint, texturePolygon)
        const xCutPoint = limitPointToPolygon(cornerPointOfRect(prevCropRect, verticalAdjacentCorner[corner]), oppositePoint, texturePolygon, true)
        if (Math.abs(oppositePoint[0] - xCutPoint[0]) < Math.abs(oppositePoint[0] - nextCornerPoint[0])) {
            nextCornerPoint[0] = xCutPoint[0]
        }
        const yCutPoint = limitPointToPolygon(cornerPointOfRect(prevCropRect, horizontalAdjacentCorner[corner]), oppositePoint, texturePolygon, true)
        if (Math.abs(oppositePoint[1] - yCutPoint[1]) < Math.abs(oppositePoint[1] - nextCornerPoint[1])) {
            nextCornerPoint[1] = yCutPoint[1]
        }

        const cropRect = rectFromPoints(roundVec2(nextCornerPoint), oppositePoint)

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


/**
 * Creates a polygon of the texture's outline (in projected coordinates).
 */
function createTexturePolygon(cameraMetrics: CameraMetrics): vec2[] {
    const { textureSize, projectionMatrix } = cameraMetrics

    // Create the polygon in texture coordinates
    const polygon = [
        vec2.fromValues(0, 0),
        vec2.fromValues(textureSize.width, 0),
        vec2.fromValues(textureSize.width, textureSize.height),
        vec2.fromValues(0, textureSize.height),
    ]

    // Transform the polygon to projected coordinates
    for (let i = 0, il = polygon.length; i < il; i++) {
        vec2.transformMat4(polygon[i], polygon[i], projectionMatrix)
    }

    return polygon
}


function limitPointToPolygon(point: vec2, referencePoint: Vec2Like, texturePolygon: Vec2Like[], goBeyoundPoint = false): vec2 {
    if (!isVectorInPolygon(referencePoint, texturePolygon)) {
        // Move referencePoint inside the polygon
        referencePoint = cutLineWithPolygon(referencePoint, directionOfPoints(referencePoint, point), texturePolygon) || referencePoint
    }

    const outFactor: number[] = []
    const cutPoint = cutLineWithPolygon(referencePoint, directionOfPoints(referencePoint, point), texturePolygon, outFactor)

    return ((goBeyoundPoint || outFactor[0] < 1) && cutPoint) ? cutPoint : point
}
