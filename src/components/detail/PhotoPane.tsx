import * as classNames from 'classnames'
import * as React from 'react'
import { findDOMNode } from 'react-dom'
import { mat4 } from 'gl-matrix'

import { ExifOrientation } from '../../models/DataTypes'
import PhotoCanvas from '../../renderer/PhotoCanvas'
import CancelablePromise, { isCancelError } from '../../util/CancelablePromise'


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

    private canvas: PhotoCanvas | null = null


    constructor(props) {
        super(props)
    }

    componentDidMount() {
        this.canvas = new PhotoCanvas()
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
            this.canvas.loadFromSrc(props.src)
                .then(() => {
                    this.canvas.getElement().style.display = null
                    this.props.onLoad()
                })
                .catch(error => {
                    if (!isCancelError(error)) {
                        console.error(`Loading ${props.src} failed`, error)
                    }
                })
        }
        if (props.width !== prevProps.width || props.height !== prevProps.height || props.orientation !== prevProps.orientation) {
            this.canvas
                .setMaxSize(props.width, props.height)
                .setExifOrientation(props.orientation)
                .update()
        }
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
