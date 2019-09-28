import { mat4 } from 'gl-matrix'

import CancelablePromise from 'common/util/CancelablePromise'
import Profiler from 'common/util/Profiler'

import { Size } from 'app/util/GeometryTypes'

import WebGLCanvas, { GraphicBuffer, Texture } from './WebGLCanvas'
import { TransformationShader } from './Shaders'


/**
 * Renders a photo using a WebGL canvas. Provides a high-level API suited for Ansel's photo rendering.
 */
export default class PhotoCanvas {

    private webGlCanvas: WebGLCanvas

    private size: Size = { width: 0, height: 0 }

    private projectionMatrix: mat4
    private cameraMatrix: mat4

    private baseTexturePromise: CancelablePromise<void> | null = null
    private baseTexture: Texture | null = null
    private unitSquareBuffer: GraphicBuffer
    private transformationShader: TransformationShader


    constructor() {
        this.webGlCanvas = new WebGLCanvas()
        const gl = this.webGlCanvas.gl

        this.cameraMatrix = mat4.create()

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
        return !!(this.baseTexture)
    }

    setSize(size: Size): this {
        this.size = size
        return this
    }

    /**
     * Sets the projection matrix translating from texture coordinates to projected coordinates.
     * See: `doc/geometry-concept.md`
     */
    setProjectionMatrix(projectionMatrix: mat4): this {
        this.projectionMatrix = projectionMatrix
        return this
    }

    /**
     * Sets the camera matrix translating projected coordinates to screen coordinates.
     * See: `doc/geometry-concept.md`
     */
    setCameraMatrix(cameraMatrix: mat4): this {
        this.cameraMatrix = cameraMatrix
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
        const { size, baseTexture } = this

        if (!baseTexture) {
            const gl = this.webGlCanvas.gl
            gl.clearColor(0.0, 0.0, 0.0, 1.0)
            gl.clear(gl.COLOR_BUFFER_BIT)

            return this
        }

        // ===== Calculate =====

        // Important for matrix: Build it backwards (first operation last)
        const matrix = mat4.create()
        // Scale from from screen coordinates (-canvasSize/2 .. canvasSize/2) to clipspace coordinates (-1 .. 1)
        mat4.scale(matrix, matrix, [ 1 / (size.width / 2), -1 / (size.height / 2), 1 ])
        // Apply camera
        mat4.multiply(matrix, matrix, this.cameraMatrix)
        // Apply projection
        mat4.multiply(matrix, matrix, this.projectionMatrix)
        // Scale from unit coordinates (0 .. 1) to texture coordinates (0 .. textureSize)
        mat4.scale(matrix, matrix, [ baseTexture.width, baseTexture.height, 1 ])

        // ===== Draw =====

        this.webGlCanvas.setSize(size.width, size.height)

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
