import * as classNames from 'classnames'
import * as React from 'react'
import { findDOMNode } from 'react-dom'

import { Glfx, GlfxCanvas, GlfxCanvasElement, GlfxTexture } from './GlfxTypes'
import { ExifOrientation } from '../../models/DataTypes'


// `node_modules/glfx-js/glfx.js` is not in a module syntax and defines the global var `fx`
// -> No way to import this, we load it in the html file
declare var fx: Glfx


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
    }

    componentWillReceiveProps(nextProps) {
        const props = this.props
        if (props.src !== nextProps.src || props.width !== nextProps.width || props.height !== nextProps.height || props.orientation !== nextProps.orientation) {
            this.destroyCanvas()
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (!this.canvas) {
            this.updateCanvas()
        }
    }

    destroyCanvas() {
        if (this.canvas) {
            this.canvas.parentNode.removeChild(this.canvas)
            this.canvas = null
        }
        if (this.texture) {
            this.texture.destroy()
            this.texture = null
        }
    }

    onTextureImageLoaded() {
        this.updateCanvas()
        this.props.onLoad()
    }

    updateCanvas() {
        const props = this.props
        const orientation = props.orientation

        this.destroyCanvas()

        const imgElem: HTMLImageElement = findDOMNode(this.refs.texture)
        if (!imgElem || !imgElem.complete) {
            return
        }

        const imgWidth  = imgElem.width
        const imgHeight = imgElem.height
        const switchSides = orientation === ExifOrientation.Left || orientation === ExifOrientation.Right
        const rotatedWidth  = switchSides ? imgHeight : imgWidth
        const rotatedHeight = switchSides ? imgWidth : imgHeight
        const canvasScale = Math.min(1, props.width / rotatedWidth, props.height / rotatedHeight)
        const canvasWidth = Math.round(imgWidth * canvasScale)
        const canvasHeight = Math.round(imgHeight * canvasScale)

        console.log('## data', JSON.stringify({ orientation, imgWidth, imgHeight, switchSides, rotatedWidth, rotatedHeight, canvasScale, canvasWidth, canvasHeight }))

        this.canvas = fx.canvas({ antialias: true })
        this.canvas.className = this.getCanvasCssClass()
        const canvas: GlfxCanvas = this.canvas
        canvas.initialize(canvasWidth, canvasHeight)

        this.texture = canvas.texture(imgElem)
        canvas
            .draw(this.texture, canvasWidth, canvasHeight)
            .update()

        imgElem.parentNode.insertBefore(this.canvas, imgElem)
    }

    getCanvasCssClass() {
        const orientation = this.props.orientation
        switch (this.props.orientation) {
            case ExifOrientation.Left:   return 'ImageCanvas-canvas isTurnedLeft'
            case ExifOrientation.Right:  return 'ImageCanvas-canvas isTurnedRight'
            case ExifOrientation.Bottom: return 'ImageCanvas-canvas isTurnedBottom'
            default:                     return 'ImageCanvas-canvas'
        }
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
