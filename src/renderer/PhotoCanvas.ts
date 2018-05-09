import { mat4 } from 'gl-matrix'

import WebGLCanvas, { GraphicBuffer, Texture } from './WebGLCanvas'
import { TransformationShader } from './Shaders'
import { ExifOrientation } from '../models/DataTypes'
import CancelablePromise from '../util/CancelablePromise'

/**
 * Renders a photo using a WebGL canvas. Provides a high-level API suited for Ansel's photo rendering.
 */
export default class PhotoCanvas {

    private webGlCanvas: WebGLCanvas

    private maxWidth: number = 0
    private maxHeight: number = 0

    private src: string
    private exifOrientation: ExifOrientation

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

    setMaxSize(width: number, height: number): this {
        this.maxWidth = width
        this.maxHeight = height

        return this
    }

    setExifOrientation(exifOrientation: ExifOrientation): this {
        this.exifOrientation = exifOrientation
        return this
    }

    loadFromSrc(src: string): CancelablePromise<void> {
        if (this.baseTexturePromise !== null) {
            this.baseTexturePromise.cancel()
        }
        this.setBaseTexture(null)

        this.baseTexturePromise = this.webGlCanvas.createTextureFromSrc(src)
            .then(texture => {
                this.baseTexturePromise = null
                this.setBaseTexture(texture)
                    .update()
            })

        return this.baseTexturePromise
    }

    setBaseTexture(texture: Texture | null): this {
        if (this.baseTexture !== null) {
            this.baseTexture.destroy()
            this.baseTexture = null
        }
        this.baseTexture = texture

        return this
    }

    update(): this {
        const baseTexture = this.baseTexture
        if (!baseTexture) {
            return this
        }

        const exifOrientation = this.exifOrientation

        // ===== Calculate =====

        const textureWidth  = baseTexture.width
        const textureHeight = baseTexture.height
        const switchSides = exifOrientation === ExifOrientation.Left || exifOrientation === ExifOrientation.Right
        const rotatedWidth  = switchSides ? textureHeight : textureWidth
        const rotatedHeight = switchSides ? textureWidth : textureHeight
        const canvasScale = Math.min(1, this.maxWidth / rotatedWidth, this.maxHeight / rotatedHeight)
        const canvasWidth = Math.round(rotatedWidth * canvasScale)
        const canvasHeight = Math.round(rotatedHeight * canvasScale)

        let rotationSteps = 0
        switch (exifOrientation) {
            case ExifOrientation.Right:  rotationSteps = 1; break
            case ExifOrientation.Bottom: rotationSteps = 2; break
            case ExifOrientation.Left:   rotationSteps = 3; break
        }

        // Important for matrix: Build it backwards (last operation first)
        const matrix = mat4.create()
        // Scale from from canvas coordinates (-canvasSize/2 .. canvasSize/2) to clipspace coordinates (-1 .. 1)
        mat4.scale(matrix, matrix, [ 1 / (canvasWidth / 2), -1 / (canvasHeight / 2), 1 ])
        // Scale texture to canvas size
        mat4.scale(matrix, matrix, [ canvasScale, canvasScale, 1 ])
        // Apply EXIF orientation
        mat4.rotateZ(matrix, matrix, rotationSteps * Math.PI / 2)
        // Scale to texture coordinates (-textureSize/2 .. textureSize/2)
        mat4.scale(matrix, matrix, [ this.baseTexture.width, this.baseTexture.height, 1 ])
        // Move texture to the center
        mat4.translate(matrix, matrix, [ -0.5, -0.5, 0 ])

        // ===== Draw =====

        this.webGlCanvas.setSize(canvasWidth, canvasHeight)

        const gl = this.webGlCanvas.gl

        // Clear the canvas before we start drawing on it.
        // TODO: Make clear color configurable
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

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
