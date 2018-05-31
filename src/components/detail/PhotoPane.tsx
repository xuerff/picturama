import * as classNames from 'classnames'
import * as React from 'react'
import { findDOMNode } from 'react-dom'
import { mat4 } from 'gl-matrix'

import { ExifOrientation } from '../../models/DataTypes'
import { PhotoWork } from '../../models/Photo'
import PhotoCanvas from '../../renderer/PhotoCanvas'
import CancelablePromise, { isCancelError } from '../../util/CancelablePromise'


interface Props {
    className?: any
    style?: any
    width: number
    height: number
    src: string
    orientation: ExifOrientation
    photoWork?: PhotoWork
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
        const canvas = this.canvas
        if (props.src !== prevProps.src) {
            canvas.getElement().style.display = 'none'
            canvas.loadFromSrc(props.src)
                .then(() => {
                    canvas.getElement().style.display = null
                    this.props.onLoad()
                })
                .catch(error => {
                    if (!isCancelError(error)) {
                        console.error(`Loading ${props.src} failed`, error)
                    }
                })
        }
        if (props.width !== prevProps.width || props.height !== prevProps.height || props.orientation !== prevProps.orientation
            || props.photoWork !== prevProps.photoWork)
        {
            canvas
                .setMaxSize(props.width, props.height)
                .setExifOrientation(props.orientation)
                .setPhotoWork(props.photoWork)
                .update()

            canvas.getElement().style.display = canvas.isValid() ? null : 'none'
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
