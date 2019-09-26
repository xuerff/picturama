import classNames from 'classnames'
import React from 'react'
import { findDOMNode } from 'react-dom'
import { mat4 } from 'gl-matrix'

import { ExifOrientation, PhotoWork } from 'common/CommonTypes'
import { profileDetailView } from 'common/LogConstants'
import Profiler from 'common/util/Profiler'
import { bindMany, isShallowEqual } from 'common/util/LangUtil'

import { showError } from 'app/ErrorPresenter'
import PhotoCameraHelper, { RequestedPhotoPosition, PhotoPosition, maxZoom } from 'app/renderer/PhotoCameraHelper'
import PhotoCanvas from 'app/renderer/PhotoCanvas'
import { Texture } from 'app/renderer/WebGLCanvas'
import { Size } from 'app/UITypes'

import './PhotoPane.less'


const textureCacheMaxSize = 5


interface TextureInfo {
    src: string
    texture: Texture
    lastUse: number
}


export interface Props {
    className?: any
    style?: any
    width: number
    height: number
    src: string
    srcPrev: string | null
    srcNext: string | null
    orientation: ExifOrientation
    photoWork: PhotoWork | null
    zoom: number
    setLoading(loading: boolean): void
    onZoomChange(zoom: number, minZoom: number, maxZoom: number): void
}

interface State {
    photoCameraHelper: PhotoCameraHelper
    prevSrc: string | null
    prevCanvasSize: Size
    textureSize: Size | null
    photoPosition: RequestedPhotoPosition
    rotationTurns: number
    cameraMatrix: mat4
    dragStart: { x: number, y: number, photoPosition: PhotoPosition } | null
}

export default class PhotoPane extends React.Component<Props, State> {

    private photoCameraHelper: PhotoCameraHelper
    private canvas: PhotoCanvas | null = null

    private isLoadingTexture = false
    private texturesWithError: { [index: string]: boolean } = {}
    private canvasSrc: string | null = null
    private textureCache: { [key:string]: TextureInfo } = {}
    private deferredHideCanvasTimeout: NodeJS.Timer | null

    private prevLoading: boolean | null = null
    private prevZoom: number | null = null
    private prevMinZoom: number | null = null


    constructor(props: Props) {
        super(props)
        bindMany(this, 'onMouseDown', 'onMouseMove', 'onMouseUp', 'onWheel')
        this.photoCameraHelper = new PhotoCameraHelper()
        this.state = {
            photoCameraHelper: this.photoCameraHelper,
            prevSrc: null,
            prevCanvasSize: { width: 0, height: 0 },
            textureSize: null,
            photoPosition: 'contain',
            rotationTurns: 0,
            cameraMatrix: this.photoCameraHelper.getCameraMatrix(),
            dragStart: null
        }
    }

    static getDerivedStateFromProps(nextProps: Props, prevState: State): Partial<State> | null {
        const { photoCameraHelper } = prevState
        let nextState: Partial<State> | null = null

        let nextPhotoPosition = prevState.photoPosition
        if (nextProps.src !== prevState.prevSrc) {
            nextState = { prevSrc: nextProps.src, textureSize: null, photoPosition: 'contain' }
        } else {
            const photoPosition = photoCameraHelper.getFinalPhotoPosition()
            if (photoPosition && nextProps.zoom !== photoPosition.zoom) {
                nextPhotoPosition = photoCameraHelper.limitPhotoPosition({ ...photoPosition, zoom: nextProps.zoom }, false)
                if (nextPhotoPosition.zoom <= photoCameraHelper.getMinZoom()) {
                    nextPhotoPosition = 'contain'
                }
                nextState = { photoPosition: nextPhotoPosition }
            }
        }

        if (nextProps.width !== prevState.prevCanvasSize.width || nextProps.height !== prevState.prevCanvasSize.height) {
            const canvasSize = { width: nextProps.width, height: nextProps.height }
            photoCameraHelper.setCanvasSize(canvasSize)
            nextState = { ...nextState, prevCanvasSize: canvasSize }
        }

        if (prevState.textureSize && nextProps.photoWork) {
            photoCameraHelper
                .setTextureSize(prevState.textureSize)
                .setExifOrientation(nextProps.orientation)
                .setPhotoWork(nextProps.photoWork)
                .setPhotoPosition(nextPhotoPosition)
            const rotationTurns = photoCameraHelper.getRotationTurns() 
            const cameraMatrix = photoCameraHelper.getCameraMatrix()
            if (rotationTurns !== prevState.rotationTurns || cameraMatrix !== prevState.cameraMatrix) {
                nextState = { ...nextState, rotationTurns, cameraMatrix }
            }
        }

        return nextState
    }

    componentDidMount() {
        this.canvas = new PhotoCanvas()
        const canvasElem = this.canvas.getElement()
        canvasElem.className = 'PhotoPane-canvas'
        canvasElem.style.display = 'none'
        const mainElem = findDOMNode(this.refs.main) as HTMLDivElement
        mainElem.appendChild(canvasElem)

        this.updateCanvas({}, {})
    }

    componentWillUnmount() {
        if (this.canvas) {
            const canvasElem = this.canvas.getElement()
            canvasElem.parentNode!.removeChild(canvasElem)
            this.canvas = null
        }
        this.removeDragListeners()
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
        this.updateCanvas(prevProps, prevState)

        const { photoCameraHelper } = this
        const photoPosition = photoCameraHelper.getFinalPhotoPosition()
        const minZoom = photoCameraHelper.getMinZoom()
        if (photoPosition && (photoPosition.zoom !== this.prevZoom || minZoom !== this.prevMinZoom)) {
            this.prevZoom = photoPosition.zoom
            this.prevMinZoom = minZoom
            this.props.onZoomChange(photoPosition.zoom, minZoom, maxZoom)
        }
    }

    private setLoading(loading: boolean) {
        if (loading !== this.prevLoading) {
            this.prevLoading = loading
            this.props.setLoading(loading)
        }
    }

    private onMouseDown(event: React.MouseEvent) {
        if (this.state.photoPosition === 'contain' || this.state.dragStart) {
            return
        }

        const { photoCameraHelper } = this
        const photoPosition = photoCameraHelper.getFinalPhotoPosition()
        if (photoPosition) {
            this.setState({ dragStart: { x: event.clientX, y: event.clientY, photoPosition } })
            window.addEventListener('mousemove', this.onMouseMove)
            window.addEventListener('mouseup', this.onMouseUp)
        }
    }

    private removeDragListeners() {
        window.removeEventListener('mousemove', this.onMouseMove)
        window.removeEventListener('mouseup', this.onMouseUp)
    }

    private onMouseMove(event: MouseEvent) {
        const { photoCameraHelper } = this
        const { dragStart } = this.state
        if (dragStart) {
            const startPhotoPosition = dragStart.photoPosition
            const zoom = startPhotoPosition.zoom

            let centerX = startPhotoPosition.centerX - (event.clientX - dragStart.x) / zoom
            let centerY = startPhotoPosition.centerY - (event.clientY - dragStart.y) / zoom
            const nextPhotoPosition = photoCameraHelper.limitPhotoPosition({ centerX, centerY, zoom }, true)

            if (!isShallowEqual(nextPhotoPosition, photoCameraHelper.getFinalPhotoPosition())) {
                this.setState({ photoPosition: nextPhotoPosition })
            }
        }
    }

    private onMouseUp() {
        this.removeDragListeners()

        if (this.state.dragStart) {
            this.setState({ dragStart: null })
        }
    }

    private onWheel(event: React.WheelEvent<HTMLDivElement>) {
        const { photoCameraHelper } = this
        const photoPosition = photoCameraHelper.getFinalPhotoPosition()
        if (!photoPosition) {
            return
        }

        const zoom = Math.min(maxZoom, photoPosition.zoom * Math.pow(1.01, -event.deltaY))
            // One wheel tick has a deltaY of ~ 4
        if (zoom === photoPosition.zoom) {
            // Nothing to do
        } else if (zoom < photoCameraHelper.getMinZoom()) {
            this.setState({ photoPosition: 'contain' })
        } else {
            const mainElem = findDOMNode(this.refs.main) as HTMLDivElement
            const mainRect = mainElem.getBoundingClientRect()

            // The mouse position in the canvas (in device pixels, relative to the center of the canvas)
            const mouseX = event.clientX - mainRect.left - mainRect.width / 2
            const mouseY = event.clientY - mainRect.top - mainRect.height / 2

            // The photo pixel where the mouse is aiming relativ (in photo pixels, relative to the top/left corner of the photo)
            const mousePhotoX = photoPosition.centerX + mouseX / photoPosition.zoom
            const mousePhotoY = photoPosition.centerY + mouseY / photoPosition.zoom

            // The new center (in photo pixels)
            const centerX = mousePhotoX - mouseX / zoom
            const centerY = mousePhotoY - mouseY / zoom

            this.setState({ photoPosition: { centerX, centerY, zoom } })
        }
    }

    private updateCanvas(prevProps: Partial<Props>, prevState: Partial<State>) {
        const { props, state, canvas } = this
        if (!canvas) {
            return
        }

        if (props.src !== prevProps.src || props.srcNext !== prevProps.srcNext || props.srcPrev !== prevProps.srcPrev) {
            this.texturesWithError = {}
        }

        this.tryToFetchTexture(props.src)
        this.tryToFetchTexture(props.srcNext)
        this.tryToFetchTexture(props.srcPrev)

        if (this.texturesWithError[props.src]) {
            showError('Showing photo failed: ' + props.src)
            canvas.getElement().style.display = 'none'
            this.setLoading(false)
            return
        }

        let canvasChanged = false

        if (this.canvasSrc !== props.src) {
            let textureToShow: Texture | null = null
            const textureInfo = this.textureCache[props.src]
            if (textureInfo) {
                textureInfo.lastUse = Date.now()
                textureToShow = textureInfo.texture
            }
            canvas.setBaseTexture(textureToShow, false)
            this.canvasSrc = textureToShow ? props.src : null
            canvasChanged = true
        }

        if (props.width !== prevProps.width || props.height !== prevProps.height) {
            canvas.setSize({ width: props.width, height: props.height })
            canvasChanged = true
        }

        if (state.rotationTurns !== prevState.rotationTurns || state.cameraMatrix !== prevState.cameraMatrix) {
            canvas
                .setRotationTurns(state.rotationTurns)
                .setCameraMatrix(state.cameraMatrix)
            canvasChanged = true
        }

        if (canvasChanged && state.textureSize) {
            if (canvas.isValid()) {
                if (this.deferredHideCanvasTimeout) {
                    clearTimeout(this.deferredHideCanvasTimeout)
                    this.deferredHideCanvasTimeout = null
                }
                canvas.update()
                canvas.getElement().style.display = null
                this.setLoading(false)
            } else if (!this.deferredHideCanvasTimeout) {
                // We hide the old image of an invalid canvas with a little delay,
                // in order to avoid blinking if loading the next texture and photo work is fast
                this.deferredHideCanvasTimeout = setTimeout(() => {
                    this.deferredHideCanvasTimeout = null
                    canvas.getElement().style.display = 'none'
                    this.setLoading(true)
                }, 100)
            }
        }
    }

    private tryToFetchTexture(src?: string | null) {
        const { canvas, textureCache } = this

        if (!canvas || !src || textureCache[src] || this.isLoadingTexture || this.texturesWithError[src]) {
            if (src === this.props.src && !this.state.textureSize && textureCache[src]) {
                const texture = textureCache[src].texture
                this.setState({ textureSize: { width: texture.width, height: texture.height } })
            }
            return
        }

        const profiler = profileDetailView ? new Profiler(`Fetching texture for ${src}`) : null
        this.isLoadingTexture = true
        canvas.createTextureFromSrc(src, profiler)
            .then(texture => {
                if (profiler) profiler.addPoint('Loaded texture')
                textureCache[src] = { src, texture, lastUse: Date.now() }

                const cachedSrcs = Object.keys(textureCache)
                if (cachedSrcs.length > textureCacheMaxSize) {
                    let oldestTextureInfo: TextureInfo | null = null
                    for (const src of cachedSrcs) {
                        const textureInfo = textureCache[src]
                        if (!oldestTextureInfo || textureInfo.lastUse < oldestTextureInfo.lastUse) {
                            oldestTextureInfo = textureInfo
                        }
                    }
                    if (oldestTextureInfo) {
                        oldestTextureInfo.texture.destroy()
                        delete textureCache[oldestTextureInfo.src]
                    }
                }

                this.isLoadingTexture = false
                if (src === this.props.src && !this.state.textureSize) {
                    this.setState({ textureSize: { width: texture.width, height: texture.height } })
                } else {
                    this.updateCanvas(this.props, this.state)
                }
                if (profiler) profiler.addPoint('Updated canvas')

                if (profiler) profiler.logResult()
            })
            .catch(error => {
                console.error(`Loading ${src} failed`, error)
                this.isLoadingTexture = false
                this.texturesWithError[src] = true
                this.updateCanvas(this.props, this.state)
            })
    }

    render() {
        const { props, state } = this
        return (
            <div
                ref="main"
                className={classNames(props.className, 'PhotoPane', { isZoomed: state.photoPosition !== 'contain', isDragging: state.dragStart })}
                style={{ ...props.style, width: props.width, height: props.height }}
                onWheel={this.onWheel}
                onMouseDown={this.onMouseDown}
            />
        )
    }
}
