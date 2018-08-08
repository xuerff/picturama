import { mat4 } from 'gl-matrix'

import { StandardShaderProgram } from './WebGLCanvas'


export class TransformationShader extends StandardShaderProgram<{ uTransformationMatrix: mat4 }> {
    constructor(gl: WebGLRenderingContext) {
        const vertexShaderSource = `
            uniform mat4 uTransformationMatrix;

            attribute vec4 aVertex;
            attribute vec2 aTextureCoord;

            varying highp vec2 vTextureCoord;

            void main() {
                gl_Position = uTransformationMatrix * aVertex;
                vTextureCoord = aTextureCoord;
            }`

        super(gl, vertexShaderSource, undefined)
    }
}
