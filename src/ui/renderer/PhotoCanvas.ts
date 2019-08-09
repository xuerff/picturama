import { mat4 } from 'gl-matrix'

import { ExifOrientation } from 'common/CommonTypes'
import { PhotoWork, getTotalRotationTurns } from 'common/models/Photo'
import CancelablePromise from 'common/util/CancelablePromise'
import Profiler from 'common/util/Profiler'

import WebGLCanvas, { GraphicBuffer, Texture } from './WebGLCanvas'
import { TransformationShader } from './Shaders'


export interface Size {
    width: number
    height: number
}

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
 * - `adjust-canvas`: Show the whole photo, adjust the size of the canvas so it has no borders
 */
export type RequestedPhotoPosition = 'contain' | 'adjust-canvas' | PhotoPosition

/**
 * Renders a photo using a WebGL canvas. Provides a high-level API suited for Ansel's photo rendering.
 */
export default class PhotoCanvas {

    private webGlCanvas: WebGLCanvas

    private size: Size = { width: 0, height: 0 }

    private exifOrientation: ExifOrientation
    private photoWork: PhotoWork | null

    private requestedPhotoPosition: RequestedPhotoPosition = 'contain'
    private finalPhotoPosition: PhotoPosition | null = null
    private rotatedWidth = 0
    private rotatedHeight = 0
    private minZoom = 0

    private baseTexturePromise: CancelablePromise<void> | null = null
    private baseTexture: Texture | null = null
    private unitSquareBuffer: GraphicBuffer
    private transformationShader: TransformationShader


    constructor() {
        this.webGlCanvas = new WebGLCanvas()
        const gl = this.webGlCanvas.gl

        // Create a buffer for a unit square (a square from 0,0 to 1,1)
        const squarePositions = new Float32Array([
            0.0, 0.0,
            1.0, 0.0,
            0.0, 1.0,
            1.0, 1.0,
        ])
        this.unitSquareBuffer = this.webGlCanvas.createBufferFromData(squarePositions, 2)

        this.transformationShader = new TransformationShader(gl)
    }

    getElement() {
        return this.webGlCanvas.getElement()
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
        const { size, rotatedWidth, finalPhotoPosition, rotatedHeight } = this
        const { zoom } = photoPosition

        const halfCanvasWidthInPhotoPix = size.width / 2 / zoom
        const halfCanvasHeightInPhotoPix = size.height / 2 / zoom
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

    isValid(): boolean {
        return !!(this.baseTexture && this.photoWork)
    }

    setSize(size: Size): this {
        this.size = size
        return this
    }

    setPhotoPosition(photoPosition: RequestedPhotoPosition): this {
        this.requestedPhotoPosition = photoPosition
        return this
    }

    getFinalPhotoPosition(): PhotoPosition | null {
        return this.finalPhotoPosition
    }

    getRotatedWidth(): number {
        return this.rotatedWidth
    }

    getRotatedHeight(): number {
        return this.rotatedHeight
    }

    getMinZoom(): number {
        return this.minZoom
    }

    setExifOrientation(exifOrientation: ExifOrientation): this {
        this.exifOrientation = exifOrientation
        return this
    }

    setPhotoWork(photoWork: PhotoWork | null): this {
        this.photoWork = photoWork
        return this
    }

    loadFromSrc(src: string, profiler: Profiler | null = null): CancelablePromise<void> {
        if (this.baseTexturePromise !== null) {
            this.baseTexturePromise.cancel()
        }
        this.setBaseTexture(null)

        this.baseTexturePromise = this.createTextureFromSrc(src, profiler)
            .then(texture => {
                this.baseTexturePromise = null
                this.setBaseTexture(texture)
                    .update()
                if (profiler) profiler.addPoint('Updadated canvas')
            })

        return this.baseTexturePromise
    }

    createTextureFromSrc(src: string, profiler: Profiler | null = null): CancelablePromise<Texture> {
        return this.webGlCanvas.createTextureFromSrc(src, undefined, undefined, profiler)
    }

    setBaseTexture(texture: Texture | null, destroyLast = true): this {
        if (destroyLast && this.baseTexture !== null) {
            this.baseTexture.destroy()
            this.baseTexture = null
        }
        this.baseTexture = texture

        return this
    }

    update(): this {
        const { baseTexture, photoWork, exifOrientation, requestedPhotoPosition } = this

        if (!baseTexture || !photoWork) {
            const gl = this.webGlCanvas.gl
            gl.clearColor(0.0, 0.0, 0.0, 1.0)
            gl.clear(gl.COLOR_BUFFER_BIT)

            return this
        }

        // ===== Calculate =====

        const rotationTurns = getTotalRotationTurns(exifOrientation, photoWork)
        const textureWidth  = baseTexture.width
        const textureHeight = baseTexture.height
        const switchSides = rotationTurns % 2 === 1
        const rotatedWidth  = switchSides ? textureHeight : textureWidth
        const rotatedHeight = switchSides ? textureWidth : textureHeight

        let finalPhotoPosition: PhotoPosition
        let canvasWidth  = this.size.width
        let canvasHeight = this.size.height
        const minZoom = Math.min(maxZoom, this.size.width / rotatedWidth, this.size.height / rotatedHeight)
        if (typeof requestedPhotoPosition === 'string') {
            if (requestedPhotoPosition === 'adjust-canvas') {
                canvasWidth  = Math.floor(rotatedWidth  * minZoom)
                canvasHeight = Math.floor(rotatedHeight * minZoom)
            }
            finalPhotoPosition = { centerX: rotatedWidth / 2, centerY: rotatedHeight / 2, zoom: minZoom }
        } else {
            finalPhotoPosition = requestedPhotoPosition
            const zoom = finalPhotoPosition.zoom
            if (zoom < minZoom || zoom > maxZoom) {
                finalPhotoPosition = { ...finalPhotoPosition, zoom: Math.min(maxZoom, Math.max(minZoom, zoom)) }
            }
        }
        this.finalPhotoPosition = finalPhotoPosition
        this.rotatedWidth = rotatedWidth
        this.rotatedHeight = rotatedHeight
        this.minZoom = minZoom

        // Important for matrix: Build it backwards (first operation last)
        const matrix = mat4.create()
        // Scale from from canvas coordinates (-canvasSize/2 .. canvasSize/2) to clipspace coordinates (-1 .. 1)
        mat4.scale(matrix, matrix, [ 1 / (canvasWidth / 2), -1 / (canvasHeight / 2), 1 ])
        // Zoom texture
        mat4.scale(matrix, matrix, [ finalPhotoPosition.zoom, finalPhotoPosition.zoom, 1 ])
        // Translate texture
        mat4.translate(matrix, matrix, [ rotatedWidth / 2 - finalPhotoPosition.centerX, rotatedHeight / 2 - finalPhotoPosition.centerY, 0 ])
        // Apply 90° rotation
        mat4.rotateZ(matrix, matrix, rotationTurns * Math.PI / 2)
        // Scale to texture coordinates (-textureSize/2 .. textureSize/2)
        mat4.scale(matrix, matrix, [ baseTexture.width, baseTexture.height, 1 ])
        // Move texture to the center
        mat4.translate(matrix, matrix, [ -0.5, -0.5, 0 ])

        // ===== Draw =====

        this.webGlCanvas.setSize(canvasWidth, canvasHeight)

        const gl = this.webGlCanvas.gl

        // Clear the canvas before we start drawing on it.
        // TODO: Make clear color configurable
        gl.clearColor(0.0, 0.0, 0.0, 1.0)
        gl.clear(gl.COLOR_BUFFER_BIT)

        this.transformationShader
            .use()
            .setVertexBuffer(this.unitSquareBuffer)
            .setTextureCoordBuffer(this.unitSquareBuffer)
            .setTexture(baseTexture)
            .setUniforms({ uTransformationMatrix: matrix })
            .draw()

        return this
    }

}
