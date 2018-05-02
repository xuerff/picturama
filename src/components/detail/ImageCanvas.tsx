import * as classNames from 'classnames'
import * as React from 'react'
import { findDOMNode } from 'react-dom'

import { Glfx, GlfxCanvas, GlfxCanvasElement, GlfxTexture } from './GlfxTypes'


// `node_modules/glfx-js/glfx.js` is not in a module syntax and defines the global var `fx`
// -> No way to import this, we load it in the html file
declare var fx: Glfx


interface Props {
    className?: any
    style?: any
    width: number
    height: number
    src: string
    /** The EXIF orientation. See: https://www.impulseadventure.com/photo/exif-orientation.html */
    orientation: number
}

interface State {
}

class ImageCanvas extends React.Component<Props, State> {

    canvas: GlfxCanvasElement | null = null
    texture: GlfxTexture | null = null


    constructor(props) {
        super(props)

        this.onTextureImageLoaded = this.onTextureImageLoaded.bind(this)
    }

    componentDidMount() {
    }

    componentWillUnmount() {
        this.destroyCanvas()
        this.destroyTexture()
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.src !== nextProps.src) {
            this.destroyCanvas()
            this.destroyTexture()
        }
    }

    destroyCanvas() {
        if (this.canvas) {
            this.canvas.parentNode.removeChild(this.canvas)
            this.canvas = null
        }
    }

    destroyTexture() {
        if (this.texture) {
            this.texture.destroy()
            this.texture = null
        }
    }

    onTextureImageLoaded() {
        const props = this.props

        const imgElem: HTMLImageElement = findDOMNode(this.refs.texture)
        const imgWidth  = imgElem.width
        const imgHeight = imgElem.height
        const imgRatio = imgWidth / imgHeight
        const viewRatio = props.width / props.height
        const canvasScale = Math.min(1, (imgHeight > viewRatio) ? (props.width / imgWidth) : (props.height / imgHeight))
        const canvasWidth = Math.round(imgWidth * canvasScale)
        const canvasHeight = Math.round(imgHeight * canvasScale)

        this.destroyCanvas()

        this.canvas = fx.canvas({ antialias: true })
        this.canvas.className = 'ImageCanvas-canvas'
        const canvas: GlfxCanvas = this.canvas
        canvas.initialize(canvasWidth, canvasHeight)

        this.texture = canvas.texture(imgElem)
        canvas
            .draw(this.texture, canvasWidth, canvasHeight)
            .update()

        imgElem.parentNode.insertBefore(this.canvas, imgElem)
    }

    render() {
        const props = this.props
        return (
            <div
                className={classNames(props.className, 'ImageCanvas')}
                style={{ ...props.style, width: props.width, height: props.height }}
            >
                <img
                    ref="texture"
                    className="ImageCanvas-texture"
                    src={props.src}
                    onLoad={this.onTextureImageLoaded}
                />
            </div>
        )
    }
}

export default ImageCanvas
