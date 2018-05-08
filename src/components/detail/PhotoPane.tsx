import * as classNames from 'classnames'
import * as React from 'react'
import { findDOMNode } from 'react-dom'
import { mat4 } from 'gl-matrix'

import { ExifOrientation } from '../../models/DataTypes'
import WebGLCanvas, { Texture } from '../../renderer/WebGLCanvas'
import CancelablePromise from '../../util/CancelablePromise'


interface Props {
    className?: any
    style?: any
    width: number
    height: number
    src: string
    orientation: ExifOrientation
    onLoad: () => void
}

interface State {
}

export default class PhotoPane extends React.Component<Props, State> {

    private canvas: WebGLCanvas | null = null
    private baseTexturePromise: CancelablePromise<void> | null = null


    constructor(props) {
        super(props)
    }

    componentDidMount() {
        this.canvas = new WebGLCanvas()
        const canvasElem = this.canvas.getElement()
        canvasElem.className = 'PhotoPane-canvas'
        findDOMNode(this.refs.main).appendChild(canvasElem)

        this.updateCanvas({})
    }

    componentWillUnmount() {
        const canvasElem = this.canvas.getElement()
        canvasElem.parentNode.removeChild(canvasElem)
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
        this.updateCanvas(prevProps)
    }

    updateCanvas(prevProps: Partial<Props>) {
        const props = this.props
        if (props.src !== prevProps.src) {
            this.canvas.getElement().style.display = 'none'

            if (this.baseTexturePromise !== null) {
                this.baseTexturePromise.cancel()
            }
    
            this.baseTexturePromise = this.canvas.createTextureFromSrc(props.src)
                .then(texture => {
                    this.canvas.setBaseTexture(texture)
                    this.baseTexturePromise = null
                    this.updateCanvasSize()
                    this.canvas.getElement().style.display = null
                    this.props.onLoad()
                })
                .catch(error => console.error(`Loading ${props.src} failed`, error))
        }
        if (props.width !== prevProps.width || props.height !== prevProps.height || props.orientation !== prevProps.orientation) {
            this.updateCanvasSize()
        }
    }

    updateCanvasSize() {
        const props = this.props

        const texture = this.canvas.getBaseTexture()
        if (texture == null) {
            return
        }

        const textureWidth  = texture.width
        const textureHeight = texture.height
        const switchSides = props.orientation === ExifOrientation.Left || props.orientation === ExifOrientation.Right
        const rotatedWidth  = switchSides ? textureHeight : textureWidth
        const rotatedHeight = switchSides ? textureWidth : textureHeight
        const canvasScale = Math.min(1, props.width / rotatedWidth, props.height / rotatedHeight)
        const canvasWidth = Math.round(rotatedWidth * canvasScale)
        const canvasHeight = Math.round(rotatedHeight * canvasScale)

        let rotationSteps = 0
        switch (props.orientation) {
            case ExifOrientation.Right:  rotationSteps = 1; break
            case ExifOrientation.Bottom: rotationSteps = 2; break
            case ExifOrientation.Left:   rotationSteps = 3; break
        }

        // Important for matrix: Build it backwards (last operation first)
        const matrix = mat4.create()
        mat4.scale(matrix, matrix, [ canvasScale, canvasScale, 1 ])
        mat4.rotateZ(matrix, matrix, rotationSteps * Math.PI / 2)

        this.canvas
            .setBaseTransformationMatrix(matrix)
            .setSize(canvasWidth, canvasHeight)
            .update()
    }

    render() {
        const props = this.props
        return (
            <div
                ref="main"
                className={classNames(props.className, 'PhotoPane')}
                style={{ ...props.style, width: props.width, height: props.height }}
            />
        )
    }
}
