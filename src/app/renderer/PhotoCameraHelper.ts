import { mat4 } from 'gl-matrix'

import { Size } from 'app/UITypes'
import { ExifOrientation, PhotoWork } from 'common/CommonTypes'
import { isShallowEqual } from 'common/util/LangUtil'
import { getTotalRotationTurns } from 'common/util/DataUtil'


export interface PhotoPosition {
    /** The x-coordinate of the photo's pixel to show at the center */
    centerX: number
    /** The y-coordinate of the photo's pixel to show at the center */
    centerY: number
    /** The zoom factor (1 = show photo 1:1) */
    zoom: number
}

export const maxZoom = 2

/**
 * - `contain`: Show the whole photo, centered in the canvas
 */
export type RequestedPhotoPosition = 'contain' | PhotoPosition

export default class PhotoCameraHelper {

    private isDirty = true

    private canvasSize: Size = { width: 0, height: 0 }
    private textureSize: Size = { width: 0, height: 0 }

    private exifOrientation: ExifOrientation
    private photoWork: PhotoWork

    private requestedPhotoPosition: RequestedPhotoPosition = 'contain'
    private finalPhotoPosition: PhotoPosition | null = null
    private rotationTurns = 0
    private rotatedWidth = 0
    private rotatedHeight = 0
    private minZoom = 0
    private cameraMatrix: mat4


    constructor() {
        this.photoWork = {}
        this.cameraMatrix = mat4.create()
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

    private update() {
        if (!this.isDirty) {
            return
        }

        const { canvasSize, textureSize, photoWork, exifOrientation, requestedPhotoPosition } = this

        const rotationTurns = getTotalRotationTurns(exifOrientation, photoWork)
        const switchSides = rotationTurns % 2 === 1
        const rotatedWidth  = switchSides ? textureSize.height : textureSize.width
        const rotatedHeight = switchSides ? textureSize.width : textureSize.height

        let finalPhotoPosition: PhotoPosition
        const minZoom = (rotatedWidth === 0 || rotatedHeight === 0) ? 0.0000001 :
            Math.min(maxZoom, canvasSize.width / rotatedWidth, canvasSize.height / rotatedHeight)
        if (typeof requestedPhotoPosition === 'string') {
            finalPhotoPosition = { centerX: rotatedWidth / 2, centerY: rotatedHeight / 2, zoom: minZoom }
        } else {
            finalPhotoPosition = requestedPhotoPosition
            const zoom = finalPhotoPosition.zoom
            if (zoom < minZoom || zoom > maxZoom) {
                finalPhotoPosition = { ...finalPhotoPosition, zoom: Math.min(maxZoom, Math.max(minZoom, zoom)) }
            }
        }
        this.finalPhotoPosition = finalPhotoPosition
        this.rotationTurns = rotationTurns
        this.rotatedWidth = rotatedWidth
        this.rotatedHeight = rotatedHeight
        this.minZoom = minZoom

        // Important for matrix: Build it backwards (first operation last)
        const matrix = mat4.create()
        // We have canvas coordinates (-canvasSize/2 .. canvasSize/2) here
        // Zoom texture
        mat4.scale(matrix, matrix, [ finalPhotoPosition.zoom, finalPhotoPosition.zoom, 1 ])
        // Translate texture
        mat4.translate(matrix, matrix, [ rotatedWidth / 2 - finalPhotoPosition.centerX, rotatedHeight / 2 - finalPhotoPosition.centerY, 0 ])
        // We have texture coordinates (-rotatedPhotoSize/2 .. rotatedPhotoSize/2) here
        this.cameraMatrix = matrix

        this.isDirty = false
    }

    /**
     * Returns the size the canvas must have in order to show the whole photo without borders.
     */
    getAdjustedCanvasSize(): Size {
        this.update()
        return {
            width:  Math.floor(this.rotatedWidth  * this.minZoom),
            height: Math.floor(this.rotatedHeight * this.minZoom)
        }
    }

    getFinalPhotoPosition(): PhotoPosition | null {
        this.update()
        return this.finalPhotoPosition
    }

    /**
     * Returns the number of clock-wise rotation turns to apply to the texture.
     *
     * This translates texture coordinates (-textureSize/2 .. textureSize/2) into
     * photo coordinates (-rotatedPhotoSize/2 .. rotatedPhotoSize/2).
     */
    getRotationTurns(): number {
        this.update()
        return this.rotationTurns
    }

    getRotatedWidth(): number {
        this.update()
        return this.rotatedWidth
    }

    getRotatedHeight(): number {
        this.update()
        return this.rotatedHeight
    }

    getMinZoom(): number {
        this.update()
        return this.minZoom
    }

    /**
     * Returns the camera matrix translating from photo coordinates (-rotatedPhotoSize/2 .. rotatedPhotoSize/2)
     * to canvas coordinates (-canvasSize/2 .. canvasSize/2).
     */
    getCameraMatrix(): mat4 {
        this.update()
        return this.cameraMatrix
    }

    /**
     * Returns a PhotoPosition which keeps the photo inside the view. Returns `photoPosition` it is already OK.
     *
     * @param allowExceedingToCurrentPosition Whether to allow exceeding min/max as far as the current photoPosition does.
     *      This may happen after zooming using the mouse wheel.
     *      So when min/max is exceeded because the user zoomed near the edges,
     *      the photo won't jump when panned, but panning back so far won't work.
     */
    limitPhotoPosition(photoPosition: PhotoPosition, allowExceedingToCurrentPosition: boolean): PhotoPosition {
        this.update()

        const { canvasSize, rotatedWidth, finalPhotoPosition, rotatedHeight } = this
        const { zoom } = photoPosition

        const halfCanvasWidthInPhotoPix = canvasSize.width / 2 / zoom
        const halfCanvasHeightInPhotoPix = canvasSize.height / 2 / zoom
        let minCenterX = Math.min(halfCanvasWidthInPhotoPix, rotatedWidth - halfCanvasWidthInPhotoPix)
        let minCenterY = Math.min(halfCanvasHeightInPhotoPix, rotatedHeight - halfCanvasHeightInPhotoPix)
        let maxCenterX = rotatedWidth - minCenterX
        let maxCenterY = rotatedHeight - minCenterY

        if (allowExceedingToCurrentPosition && finalPhotoPosition && photoPosition.zoom === finalPhotoPosition.zoom) {
            minCenterX = Math.min(minCenterX, finalPhotoPosition.centerX)
            maxCenterX = Math.max(maxCenterX, finalPhotoPosition.centerX)
            minCenterY = Math.min(minCenterY, finalPhotoPosition.centerY)
            maxCenterY = Math.max(maxCenterY, finalPhotoPosition.centerY)
        }

        const centerX = Math.max(minCenterX, Math.min(maxCenterX, photoPosition.centerX))
        const centerY = Math.max(minCenterY, Math.min(maxCenterY, photoPosition.centerY))

        if (centerX === photoPosition.centerX && centerY === photoPosition.centerY) {
            return photoPosition
        } else {
            return { centerX, centerY, zoom }
        }
    }

}
