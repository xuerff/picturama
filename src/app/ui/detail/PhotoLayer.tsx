import classNames from 'classnames'
import React from 'react'
import { findDOMNode } from 'react-dom'

import { CameraMetrics } from 'common/util/CameraMetrics'
import { Size, zeroSize } from 'common/util/GeometryTypes'
import { bindMany } from 'common/util/LangUtil'
import { ExifOrientation } from 'common/CommonTypes'
import { profileDetailView } from 'common/LogConstants'

import PhotoCanvas from 'app/renderer/PhotoCanvas'
import { Texture } from 'app/renderer/WebGLCanvas'

import { DetailMode } from './DetailTypes'
import TextureCache from './TextureCache'

import './PhotoLayer.less'


export type PhotoLayerLoadingState = 'loading' | 'error' | 'done'


export interface Props {
    className?: any
    style?: any
    mode: DetailMode
    /** The size of the detail body (in px) */
    bodySize: Size
    src: string
    srcPrev: string | null
    srcNext: string | null
    orientation: ExifOrientation
    cameraMetrics: CameraMetrics | null
    onLoadingStateChange(loadingState: PhotoLayerLoadingState): void
    onTextureSizeChange(textureSize: Size): void
}

interface State {
    prevSrc: string | null
    prevCanvasSize: Size
}

export default class PhotoLayer extends React.Component<Props, State> {

    private canvas: PhotoCanvas | null = null
    private textureCache: TextureCache | null = null

    private canvasSrc: string | null = null
    private deferredHideCanvasTimeout: NodeJS.Timer | null

    private prevLoadingState: PhotoLayerLoadingState | null = null


    constructor(props: Props) {
        super(props)
        bindMany(this, 'onTextureFetched')
        this.state = {
            prevSrc: null,
            prevCanvasSize: zeroSize,
        }
    }

    componentDidMount() {
        this.canvas = new PhotoCanvas()
        const canvasElem = this.canvas.getElement()
        canvasElem.className = 'PhotoLayer-canvas'
        canvasElem.style.display = 'none'
        const mainElem = findDOMNode(this.refs.main) as HTMLDivElement
        mainElem.appendChild(canvasElem)

        this.textureCache = new TextureCache({
            canvas: this.canvas,
            maxCacheSize: 5,
            profile: profileDetailView,
            onTextureFetched: this.onTextureFetched
        })

        this.updateCanvas({}, {})
    }

    componentWillUnmount() {
        if (this.canvas) {
            const canvasElem = this.canvas.getElement()
            canvasElem.parentNode!.removeChild(canvasElem)
            this.canvas = null
        }
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
        this.updateCanvas(prevProps, prevState)
    }

    private setLoadingState(loadingState: PhotoLayerLoadingState) {
        if (loadingState !== this.prevLoadingState) {
            this.prevLoadingState = loadingState
            this.props.onLoadingStateChange(loadingState)
        }
    }

    private onTextureFetched(src: string, texture: Texture | null) {
        if (src === this.props.src && texture) {
            this.props.onTextureSizeChange({ width: texture.width, height: texture.height })
        }
        this.updateCanvas(this.props, this.state)
    }

    private updateCanvas(prevProps: Partial<Props>, prevState: Partial<State>) {
        const { props, state, canvas, textureCache } = this
        if (!canvas || !textureCache) {
            return
        }

        textureCache.setSourcesToFetch([ props.src, props.srcNext, props.srcPrev ])

        if (textureCache.hasTextureError(props.src)) {
            canvas.getElement().style.display = 'none'
            this.setLoadingState('error')
            return
        }

        let canvasChanged = false

        if (this.canvasSrc !== props.src) {
            let texture = textureCache.getTexture(props.src)
            canvas.setBaseTexture(texture, false)
            this.canvasSrc = texture ? props.src : null
            if (texture) {
                this.props.onTextureSizeChange({ width: texture.width, height: texture.height })
            }
            canvasChanged = true
        }

        if (props.bodySize !== prevProps.bodySize) {
            const canvasElem = canvas.getElement()
            canvasElem.style.width  = `${props.bodySize.width}px`
            canvasElem.style.height = `${props.bodySize.height}px`
        }

        if (props.mode !== prevProps.mode || props.cameraMetrics !== prevProps.cameraMetrics) {
            canvas.setClipRect((props.mode === 'view' && props.cameraMetrics) ? props.cameraMetrics.cropRect : null)
            canvasChanged = true
        }

        if (props.cameraMetrics !== prevProps.cameraMetrics) {
            if (props.cameraMetrics) {
                canvas
                    .setSize(props.cameraMetrics.canvasSize)
                    .setProjectionMatrix(props.cameraMetrics.projectionMatrix)
                    .setCameraMatrix(props.cameraMetrics.cameraMatrix)
            }
            canvasChanged = true
        }

        if (canvasChanged) {
            if (props.cameraMetrics && canvas.isValid()) {
                if (this.deferredHideCanvasTimeout) {
                    clearTimeout(this.deferredHideCanvasTimeout)
                    this.deferredHideCanvasTimeout = null
                }
                canvas.update()
                canvas.getElement().style.display = 'block'
                this.setLoadingState('done')
            } else if (!this.deferredHideCanvasTimeout) {
                // We hide the old image of an invalid canvas with a little delay,
                // in order to avoid blinking if loading the next texture and photo work is fast
                this.deferredHideCanvasTimeout = setTimeout(() => {
                    this.deferredHideCanvasTimeout = null
                    canvas.getElement().style.display = 'none'
                    this.setLoadingState('loading')
                }, 100)
            }
        }
    }

    render() {
        const { props } = this
        return (
            <div
                ref="main"
                className={classNames(props.className, 'PhotoLayer')}
                style={{ ...props.style, width: props.bodySize.width, height: props.bodySize.height }}
            />
        )
    }
}
