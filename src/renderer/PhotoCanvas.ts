import { mat4 } from 'gl-matrix'

import WebGLCanvas, { GraphicBuffer, Texture } from './WebGLCanvas'
import { TransformationShader } from './Shaders'
import { ExifOrientation } from '../models/DataTypes'
import { PhotoWork } from '../models/Photo'
import CancelablePromise from '../util/CancelablePromise'
import Profiler from '../util/Profiler'

/**
 * Renders a photo using a WebGL canvas. Provides a high-level API suited for Ansel's photo rendering.
 */
export default class PhotoCanvas {

    private webGlCanvas: WebGLCanvas

    private maxWidth: number = 0
    private maxHeight: number = 0

    private src: string
    private exifOrientation: ExifOrientation
    private photoWork: PhotoWork | null

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

    isValid(): boolean {
        return !!(this.baseTexture && this.photoWork)
    }

    setMaxSize(width: number, height: number): this {
        this.maxWidth = width
        this.maxHeight = height

        return this
    }

    setExifOrientation(exifOrientation: ExifOrientation): this {
        this.exifOrientation = exifOrientation
        return this
    }

    setPhotoWork(photoWork: PhotoWork | null): this {
        this.photoWork = photoWork
        return this
    }

    loadFromSrc(src: string, profiler: Profiler = null): CancelablePromise<void> {
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

    createTextureFromSrc(src: string, profiler: Profiler = null): CancelablePromise<Texture> {
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
        if (!this.isValid()) {
            const gl = this.webGlCanvas.gl
            gl.clearColor(0.0, 0.0, 0.0, 1.0)
            gl.clear(gl.COLOR_BUFFER_BIT)

            return this
        }

        const { baseTexture, photoWork, exifOrientation} = this

        // ===== Calculate =====

        let rotationTurns = 0
        switch (exifOrientation) {
            case ExifOrientation.Right:  rotationTurns = 1; break
            case ExifOrientation.Bottom: rotationTurns = 2; break
            case ExifOrientation.Left:   rotationTurns = 3; break
        }
        rotationTurns = (rotationTurns + (photoWork.rotationTurns || 0)) % 4

        const textureWidth  = baseTexture.width
        const textureHeight = baseTexture.height
        const switchSides = rotationTurns % 2 === 1
        const rotatedWidth  = switchSides ? textureHeight : textureWidth
        const rotatedHeight = switchSides ? textureWidth : textureHeight
        const canvasScale = Math.min(1, this.maxWidth / rotatedWidth, this.maxHeight / rotatedHeight)
        const canvasWidth = Math.round(rotatedWidth * canvasScale)
        const canvasHeight = Math.round(rotatedHeight * canvasScale)

        // Important for matrix: Build it backwards (first operation last)
        const matrix = mat4.create()
        // Scale from from canvas coordinates (-canvasSize/2 .. canvasSize/2) to clipspace coordinates (-1 .. 1)
        mat4.scale(matrix, matrix, [ 1 / (canvasWidth / 2), -1 / (canvasHeight / 2), 1 ])
        // Scale texture to canvas size
        mat4.scale(matrix, matrix, [ canvasScale, canvasScale, 1 ])
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
