import { mat4 } from 'gl-matrix'

import { Size, zeroSize } from 'app/UITypes'
import { ExifOrientation, PhotoWork } from 'common/CommonTypes'
import { isShallowEqual } from 'common/util/LangUtil'
import { getTotalRotationTurns } from 'common/util/DataUtil'


export const maxZoom = 2

export interface CameraMetrics {
    canvasSize: Size
    textureSize: Size
    requestedPhotoPosition: RequestedPhotoPosition
    photoPosition: PhotoPosition
    /**
     * The number of clock-wise rotation turns to apply to the texture.
     *
     * This translates texture coordinates (-textureSize/2 .. textureSize/2) into
     * photo coordinates (-rotatedPhotoSize/2 .. rotatedPhotoSize/2).
     */
    rotationTurns: number
    rotatedWidth: number
    rotatedHeight: number
    minZoom: number
    maxZoom: number
    /**
     * The camera matrix translating from photo coordinates (-rotatedPhotoSize/2 .. rotatedPhotoSize/2)
     * to canvas coordinates (-canvasSize/2 .. canvasSize/2).
     */
    cameraMatrix: mat4
}

export const zeroCameraMetrics: CameraMetrics = {
    canvasSize: zeroSize,
    textureSize: zeroSize,
    requestedPhotoPosition: 'contain',
    photoPosition: { centerX: 0, centerY: 0, zoom: 0 },
    rotationTurns: 0,
    rotatedWidth: 0,
    rotatedHeight: 0,
    minZoom: 0,
    maxZoom,
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

        const { canvasSize, textureSize, photoWork, exifOrientation, requestedPhotoPosition } = this

        const rotationTurns = getTotalRotationTurns(exifOrientation, photoWork)
        const switchSides = rotationTurns % 2 === 1
        const rotatedWidth  = switchSides ? textureSize.height : textureSize.width
        const rotatedHeight = switchSides ? textureSize.width : textureSize.height

        let photoPosition: PhotoPosition
        const minZoom = (rotatedWidth === 0 || rotatedHeight === 0) ? 0.0000001 :
            Math.min(maxZoom, canvasSize.width / rotatedWidth, canvasSize.height / rotatedHeight)
        if (typeof requestedPhotoPosition === 'string') {
            photoPosition = { centerX: rotatedWidth / 2, centerY: rotatedHeight / 2, zoom: minZoom }
        } else {
            photoPosition = requestedPhotoPosition
            const zoom = photoPosition.zoom
            if (zoom < minZoom || zoom > maxZoom) {
                photoPosition = { ...photoPosition, zoom: Math.min(maxZoom, Math.max(minZoom, zoom)) }
            }
        }

        // Important for matrix: Build it backwards (first operation last)
        const cameraMatrix = mat4.create()
        // We have canvas coordinates (-canvasSize/2 .. canvasSize/2) here
        // Zoom texture
        mat4.scale(cameraMatrix, cameraMatrix, [ photoPosition.zoom, photoPosition.zoom, 1 ])
        // Translate texture
        mat4.translate(cameraMatrix, cameraMatrix, [ rotatedWidth / 2 - photoPosition.centerX, rotatedHeight / 2 - photoPosition.centerY, 0 ])
        // We have texture coordinates (-rotatedPhotoSize/2 .. rotatedPhotoSize/2) here

        this.cameraMetrics = {
            canvasSize: this.canvasSize,
            textureSize: this.textureSize,
            requestedPhotoPosition: this.requestedPhotoPosition,
            photoPosition,
            rotationTurns,
            rotatedWidth,
            rotatedHeight,
            minZoom,
            maxZoom,
            cameraMatrix,
        }
        this.isDirty = false
        return this.cameraMetrics
    }

    /**
     * Returns the size the canvas must have in order to show the whole photo without borders.
     */
    getAdjustedCanvasSize(): Size {
        const cameraMetrics = this.getCameraMetrics()
        return {
            width:  Math.floor(cameraMetrics.rotatedWidth  * cameraMetrics.minZoom),
            height: Math.floor(cameraMetrics.rotatedHeight * cameraMetrics.minZoom)
        }
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
    const { canvasSize, rotatedWidth, photoPosition: prevPhotoPosition, rotatedHeight } = cameraMetrics
    const { zoom } = photoPosition

    const halfCanvasWidthInPhotoPix = canvasSize.width / 2 / zoom
    const halfCanvasHeightInPhotoPix = canvasSize.height / 2 / zoom
    let minCenterX = Math.min(halfCanvasWidthInPhotoPix, rotatedWidth - halfCanvasWidthInPhotoPix)
    let minCenterY = Math.min(halfCanvasHeightInPhotoPix, rotatedHeight - halfCanvasHeightInPhotoPix)
    let maxCenterX = rotatedWidth - minCenterX
    let maxCenterY = rotatedHeight - minCenterY

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
