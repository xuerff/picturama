import { mat4 } from 'gl-matrix'

import { ExifOrientation, PhotoWork } from 'common/CommonTypes'
import { isShallowEqual } from 'common/util/LangUtil'
import { getTotalRotationTurns } from 'common/util/DataUtil'

import { Size, zeroSize, Rect, zeroRect } from 'app/util/GeometryTypes'


export const maxZoom = 2

export interface CameraMetrics {
    canvasSize: Size
    textureSize: Size
    requestedPhotoPosition: RequestedPhotoPosition
    photoPosition: PhotoPosition
    minZoom: number
    maxZoom: number
    cropRect: Rect
    /**
     * The projection matrix translating from texture coordinates to projected coordinates.
     * See: `doc/geometry-concept.md`
     */
    projectionMatrix: mat4
    /**
     * The camera matrix translating projected coordinates to screen coordinates.
     * See: `doc/geometry-concept.md`
     */
    cameraMatrix: mat4
}

export const zeroCameraMetrics: CameraMetrics = {
    canvasSize: zeroSize,
    textureSize: zeroSize,
    requestedPhotoPosition: 'contain',
    photoPosition: { centerX: 0, centerY: 0, zoom: 0 },
    cropRect: zeroRect,
    minZoom: 0,
    maxZoom,
    projectionMatrix: mat4.create(),
    cameraMatrix: mat4.create(),
}

export interface PhotoPosition {
    /** The x-coordinate of the photo's pixel to show at the center */
    centerX: number
    /** The y-coordinate of the photo's pixel to show at the center */
    centerY: number
    /** The zoom factor (1 = show photo 1:1) */
    zoom: number
}

/**
 * - `contain`: Show the whole photo, centered in the canvas
 */
export type RequestedPhotoPosition = 'contain' | PhotoPosition

export class CameraMetricsBuilder {

    private canvasSize: Size = zeroSize
    private textureSize: Size = zeroSize
    private requestedPhotoPosition: RequestedPhotoPosition = 'contain'
    private adjustCanvasSize = false
    private exifOrientation: ExifOrientation
    private photoWork: PhotoWork

    private isDirty = true
    private cameraMetrics: CameraMetrics = zeroCameraMetrics


    constructor() {
        this.photoWork = {}
    }

    setCanvasSize(canvasSize: Size): this {
        if (!isShallowEqual(this.canvasSize, canvasSize)) {
            this.canvasSize = canvasSize
            this.isDirty = true
        }
        return this
    }

    setTextureSize(textureSize: Size): this {
        if (!isShallowEqual(this.textureSize, textureSize)) {
            this.textureSize = textureSize
            this.isDirty = true
        }
        return this
    }

    setPhotoPosition(photoPosition: RequestedPhotoPosition): this {
        if (!isShallowEqual(this.requestedPhotoPosition, photoPosition)) {
            this.requestedPhotoPosition = photoPosition
            this.isDirty = true
        }
        return this
    }

    getRequestedPhotoPosition(): RequestedPhotoPosition {
        return this.requestedPhotoPosition
    }

    /**
     * Sets whether the `canvasSize` of the CameraMetrics should be adjusted in order to show the whole photo without
     * borders.
     * This will only be done if `requestedPhotoPosition` is `'contain'`.
     * This only changes the `canvasSize` of the CameraMetrics returned by `getCameraMetrics` it does not change the
     * canvas size set by `setCanvasSize`.
     */
    setAdjustCanvasSize(adjustCanvasSize: boolean): this {
        if (this.adjustCanvasSize !== adjustCanvasSize) {
            this.adjustCanvasSize = adjustCanvasSize
            this.isDirty = true
        }
        return this
    }

    setExifOrientation(exifOrientation: ExifOrientation): this {
        if (this.exifOrientation !== exifOrientation) {
            this.exifOrientation = exifOrientation
            this.isDirty = true
        }
        return this
    }

    setPhotoWork(photoWork: PhotoWork): this {
        if (this.photoWork !== photoWork) {
            this.photoWork = photoWork
            this.isDirty = true
        }
        return this
    }

    getCameraMetrics(): CameraMetrics {
        if (!this.isDirty) {
            return this.cameraMetrics
        }

        const { textureSize, photoWork, exifOrientation, requestedPhotoPosition } = this
        let { canvasSize } = this

        const rotationTurns = getTotalRotationTurns(exifOrientation, photoWork)
        const switchSides = rotationTurns % 2 === 1
        const rotatedWidth  = switchSides ? textureSize.height : textureSize.width
        const rotatedHeight = switchSides ? textureSize.width : textureSize.height
        const cropRect = { x: -rotatedWidth / 2, y: -rotatedHeight / 2, width: rotatedWidth, height: rotatedHeight }

        let photoPosition: PhotoPosition
        const minZoom = (rotatedWidth === 0 || rotatedHeight === 0) ? 0.0000001 :
            Math.min(maxZoom, canvasSize.width / rotatedWidth, canvasSize.height / rotatedHeight)
        if (typeof requestedPhotoPosition === 'string') {
            const zoom = minZoom
            photoPosition = { centerX: rotatedWidth / 2, centerY: rotatedHeight / 2, zoom }
            if (this.adjustCanvasSize) {
                canvasSize = {
                    width:  Math.floor(cropRect.width  * zoom),
                    height: Math.floor(cropRect.height * zoom)
                }
            }
        } else {
            photoPosition = requestedPhotoPosition
            const zoom = photoPosition.zoom
            if (zoom < minZoom || zoom > maxZoom) {
                photoPosition = { ...photoPosition, zoom: Math.min(maxZoom, Math.max(minZoom, zoom)) }
            }
        }

        // Important for matrix: Build it backwards (first operation last)

        const cameraMatrix = mat4.create()
        // We have canvas coordinates here
        // Move origin to left-top corner
        mat4.translate(cameraMatrix, cameraMatrix, [ canvasSize.width / 2, canvasSize.height / 2, 0 ])
        // Scale from texture pixels to screen pixels
        mat4.scale(cameraMatrix, cameraMatrix, [ photoPosition.zoom, photoPosition.zoom, 1 ])
        // Translate texture
        mat4.translate(cameraMatrix, cameraMatrix, [ -cropRect.x - photoPosition.centerX, -cropRect.y - photoPosition.centerY, 0 ])
        // We have projected coordinates here

        const projectionMatrix = mat4.create()
        // We have projected coordinates here
        // Apply 90° rotation
        mat4.rotateZ(projectionMatrix, projectionMatrix, rotationTurns * Math.PI / 2)
        // Move texture to the center
        mat4.translate(projectionMatrix, projectionMatrix, [ -textureSize.width / 2, -textureSize.height / 2, 0 ])
        // We have texture coordinates here

        this.cameraMetrics = {
            canvasSize,
            textureSize,
            requestedPhotoPosition,
            photoPosition,
            minZoom,
            maxZoom,
            cropRect,
            projectionMatrix,
            cameraMatrix,
        }
        this.isDirty = false
        return this.cameraMetrics
    }

}


/**
 * Returns a PhotoPosition which keeps the photo inside the view. Returns `photoPosition` it is already OK.
 *
 * @param allowExceedingToCurrentPosition Whether to allow exceeding min/max as far as the current photoPosition does.
 *      This may happen after zooming using the mouse wheel.
 *      So when min/max is exceeded because the user zoomed near the edges,
 *      the photo won't jump when panned, but panning back so far won't work.
 */
export function limitPhotoPosition(cameraMetrics: CameraMetrics, photoPosition: PhotoPosition, allowExceedingToCurrentPosition: boolean): PhotoPosition {
    const { canvasSize, photoPosition: prevPhotoPosition, cropRect } = cameraMetrics
    const { zoom } = photoPosition

    const halfCanvasWidthInPhotoPix = canvasSize.width / 2 / zoom
    const halfCanvasHeightInPhotoPix = canvasSize.height / 2 / zoom
    let minCenterX = Math.min(halfCanvasWidthInPhotoPix, cropRect.width - halfCanvasWidthInPhotoPix)
    let minCenterY = Math.min(halfCanvasHeightInPhotoPix, cropRect.height - halfCanvasHeightInPhotoPix)
    let maxCenterX = cropRect.width - minCenterX
    let maxCenterY = cropRect.height - minCenterY

    if (allowExceedingToCurrentPosition && prevPhotoPosition && photoPosition.zoom === prevPhotoPosition.zoom) {
        minCenterX = Math.min(minCenterX, prevPhotoPosition.centerX)
        maxCenterX = Math.max(maxCenterX, prevPhotoPosition.centerX)
        minCenterY = Math.min(minCenterY, prevPhotoPosition.centerY)
        maxCenterY = Math.max(maxCenterY, prevPhotoPosition.centerY)
    }

    const centerX = Math.max(minCenterX, Math.min(maxCenterX, photoPosition.centerX))
    const centerY = Math.max(minCenterY, Math.min(maxCenterY, photoPosition.centerY))

    if (centerX === photoPosition.centerX && centerY === photoPosition.centerY) {
        return photoPosition
    } else {
        return { centerX, centerY, zoom }
    }
}
