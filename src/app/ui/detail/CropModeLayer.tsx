import React from 'react'
import classnames from 'classnames'

import { PhotoWork, ExifOrientation } from 'common/CommonTypes'
import { vec2 } from 'gl-matrix'

import { CameraMetrics, getInvertedCameraMatrix, getInvertedProjectionMatrix, createProjectionMatrix } from 'app/renderer/CameraMetrics'
import { Point, Corner, Size } from 'app/util/GeometryTypes'
import {
    transformRect, oppositeCorner, cornerPointOfRect, toVec2, centerOfRect, intersectLineWithPolygon,
    rectFromCenterAndSize, scaleSize, isPointInPolygon, nearestPointOnPolygon, Vec2Like, rectFromCornerPointAndSize,
    roundRect
} from 'app/util/GeometryUtil'

import CropOverlay from './CropOverlay'
import { bindMany, isShallowEqual } from 'common/util/LangUtil'
import CropModeToolbar from './CropModeToolbar'


const minCropRectSize = 32


export interface Props {
    topBarClassName: string
    bodyClassName: string
    exifOrientation: ExifOrientation
    photoWork: PhotoWork
    cameraMetrics: CameraMetrics
    onPhotoWorkEdited(photoWork: PhotoWork): void
    onDone(): void
}

interface State {
    tiltCenterInTextureCoords: vec2 | null
    tiltMaxCropRectSize: Size | null
}

export default class CropModeLayer extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props)
        bindMany(this, 'onCornerDrag', 'onTiltChange')
        this.state = { tiltCenterInTextureCoords: null, tiltMaxCropRectSize: null }
    }

    private onCornerDrag(corner: Corner, point: Point, isFinished: boolean) {
        const { props } = this
        const { cameraMetrics } = props
        const prevCropRect = cameraMetrics.cropRect

        const invertedCameraMatrix = getInvertedCameraMatrix(cameraMetrics)
        const projectedPoint = vec2.transformMat4(vec2.create(), toVec2(point), invertedCameraMatrix)
        const oppositePoint = cornerPointOfRect(prevCropRect, oppositeCorner[corner])

        // Limit the crop rect to the texture
        // The oppositePoint stays fixed, find width/height that fits into the texture
        const texturePolygon = createTexturePolygon(cameraMetrics)
        const wantedCornerPoint = isPointInPolygon(projectedPoint, texturePolygon) ? projectedPoint : nearestPointOnPolygon(projectedPoint, texturePolygon)
        const nextCropRectSize = {
            width:  wantedCornerPoint[0] - oppositePoint[0],
            height: wantedCornerPoint[1] - oppositePoint[1]
        }
        const xCutFactor = maxCutFactor(oppositePoint, [nextCropRectSize.width, 0], texturePolygon)
        if (xCutFactor && xCutFactor < 1) {
            nextCropRectSize.width *= xCutFactor
        }
        const yCutFactor = maxCutFactor(oppositePoint, [0, nextCropRectSize.height], texturePolygon)
        if (yCutFactor && yCutFactor < 1) {
            nextCropRectSize.height *= yCutFactor
        }
        const cornerDirection = [
            corner === 'ne' || corner === 'se' ? 1 : -1,
            corner === 'sw' || corner === 'se' ? 1 : -1
        ]
        nextCropRectSize.width  = cornerDirection[0] * Math.max(minCropRectSize, Math.floor(cornerDirection[0] * nextCropRectSize.width))
        nextCropRectSize.height = cornerDirection[1] * Math.max(minCropRectSize, Math.floor(cornerDirection[1] * nextCropRectSize.height))
        const cropRect = rectFromCornerPointAndSize(oppositePoint, nextCropRectSize)

        // Apply changes
        this.onPhotoWorkEdited({ ...props.photoWork, cropRect })
        if (this.state.tiltCenterInTextureCoords) {
            this.setState({ tiltCenterInTextureCoords: null, tiltMaxCropRectSize: null })
        }
    }

    private onTiltChange(tilt: number) {
        const { props } = this
        const { cameraMetrics } = props
        let nextState: Partial<State> | null = null
        const prevCropRect = cameraMetrics.cropRect

        // Apply tilt
        const photoWork = { ...props.photoWork }
        if (tilt === 0) {
            delete photoWork.tilt
        } else {
            photoWork.tilt = tilt
        }

        // Get center and maximum size of crop rect
        let { tiltCenterInTextureCoords, tiltMaxCropRectSize } = this.state
        if (!tiltCenterInTextureCoords || !tiltMaxCropRectSize) {
            const center = centerOfRect(prevCropRect)
            vec2.transformMat4(center, center, getInvertedProjectionMatrix(cameraMetrics))
            tiltCenterInTextureCoords = center
            tiltMaxCropRectSize = { width: prevCropRect.width, height: prevCropRect.height }
            nextState = { tiltCenterInTextureCoords, tiltMaxCropRectSize }
        }

        // Adjust crop rect
        const texturePolygon = createTexturePolygon(cameraMetrics)
        const nextProjectionMatrix = createProjectionMatrix(cameraMetrics.textureSize, props.exifOrientation, photoWork)
        const nextCropRectCenter = vec2.transformMat4(vec2.create(), tiltCenterInTextureCoords, nextProjectionMatrix)
        let outFactors: number[]
        outFactors = intersectLineWithPolygon(nextCropRectCenter, [tiltMaxCropRectSize.width / 2, tiltMaxCropRectSize.height / 2], texturePolygon)
        let minFactor = outFactors.reduce((minFactor, factor) => Math.min(minFactor, Math.abs(factor)), 1)
        outFactors = intersectLineWithPolygon(nextCropRectCenter, [tiltMaxCropRectSize.width / 2, -tiltMaxCropRectSize.height / 2], texturePolygon)
        minFactor = outFactors.reduce((minFactor, factor) => Math.min(minFactor, Math.abs(factor)), minFactor)
        photoWork.cropRect = roundRect(rectFromCenterAndSize(nextCropRectCenter, scaleSize(tiltMaxCropRectSize, minFactor)))

        // Apply changes
        this.onPhotoWorkEdited(photoWork)
        if (nextState) {
            this.setState(nextState as any)
        }
    }

    private onPhotoWorkEdited(photoWork: PhotoWork) {
        const { cropRect } = photoWork
        if (cropRect) {
            if (isShallowEqual(cropRect, this.props.cameraMetrics.neutralCropRect)) {
                delete photoWork.cropRect
            } else {
                photoWork.cropRect = cropRect
            }
        }

        this.props.onPhotoWorkEdited(photoWork)
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


function maxCutFactor(lineStart: Vec2Like, lineDirection: Vec2Like, polygonPoints: Vec2Like[]): number | null {
    const factors = intersectLineWithPolygon(lineStart, lineDirection, polygonPoints)
    if (factors.length) {
        return factors[factors.length - 1]
    } else {
        return null
    }
}
