import classNames from 'classnames'
import React from 'react'
import { findDOMNode } from 'react-dom'

import { profileDetailView } from 'common/LogConstants'
import { ExifOrientation } from 'common/models/DataTypes'
import { PhotoWork } from 'common/models/Photo'
import Profiler from 'common/util/Profiler'
import { bindMany } from 'common/util/LangUtil'

import PhotoCanvas, { RequestedPhotoPosition, PhotoPosition, maxZoom } from 'ui/renderer/PhotoCanvas'
import { Texture } from 'ui/renderer/WebGLCanvas'

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
    setLoading: (loading: boolean) => void
}

interface State {
    prevSrc: string | null
    photoPosition: RequestedPhotoPosition
    dragStart: { x: number, y: number, photoPosition: PhotoPosition } | null
}

export default class PhotoPane extends React.Component<Props, State> {

    private canvas: PhotoCanvas | null = null

    private isLoadingTexture = false
    private texturesWithError: { [index: string]: boolean } = {}
    private canvasSrc: string | null = null
    private textureCache: { [key:string]: TextureInfo } = {}
    private deferredHideCanvasTimeout: NodeJS.Timer | null

    private prevLoading: boolean | null = null


    constructor(props: Props) {
        super(props)
        this.state = { prevSrc: null, photoPosition: 'contain', dragStart: null }
        bindMany(this, 'onMouseDown', 'onMouseMove', 'onMouseUp', 'onWheel')
    }

    static getDerivedStateFromProps(nextProps: Props, prevState: State): Partial<State> | null {
        if (nextProps.src !== prevState.prevSrc) {
            return { prevSrc: nextProps.src, photoPosition: 'contain' }
        }
        return null
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

        const { canvas } = this
        const photoPosition = canvas && canvas.getFinalPhotoPosition()
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
        const { canvas } = this
        const { dragStart } = this.state
        if (canvas && dragStart) {
            const photoPosition = canvas.getFinalPhotoPosition()
            if (photoPosition) {
                const startPhotoPosition = dragStart.photoPosition
                const zoom = startPhotoPosition.zoom

                const mainElem = findDOMNode(this.refs.main) as HTMLDivElement
                const rotatedWidth = canvas.getRotatedWidth()
                const rotatedHeight = canvas.getRotatedHeight()
                const halfCanvasWidthInPhotoPix = mainElem.offsetWidth / 2 / zoom
                const halfCanvasHeightInPhotoPix = mainElem.offsetHeight / 2 / zoom
                const minCenterX = Math.min(halfCanvasWidthInPhotoPix, rotatedWidth - halfCanvasWidthInPhotoPix)
                const minCenterY = Math.min(halfCanvasHeightInPhotoPix, rotatedHeight - halfCanvasHeightInPhotoPix)
                const maxCenterX = rotatedWidth - minCenterX
                const maxCenterY = rotatedHeight - minCenterY

                // Don't allow panning the photo out of view
                // Allow exceeding min/max as far as the current photoPosition does
                // This may happen after zooming. So when min/max is exceeded because the user zoomed near the edges,
                // the photo won't jump when panned, but panning back so far won't work.
                let centerX = startPhotoPosition.centerX - (event.clientX - dragStart.x) / zoom
                let centerY = startPhotoPosition.centerY - (event.clientY - dragStart.y) / zoom
                if (centerX < minCenterX) {
                    centerX = Math.max(centerX, Math.min(minCenterX, photoPosition.centerX))
                }
                if (centerX > maxCenterX) {
                    centerX = Math.min(centerX, Math.max(maxCenterX, photoPosition.centerX))
                }
                if (centerY < minCenterY) {
                    centerY = Math.max(centerY, Math.min(minCenterY, photoPosition.centerY))
                }
                if (centerY > maxCenterY) {
                    centerY = Math.min(centerY, Math.max(maxCenterY, photoPosition.centerY))
                }

                if (centerX !== photoPosition.centerX || centerY !== photoPosition.centerY) {
                    this.setState({ photoPosition: { centerX, centerY, zoom } })
                }
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
        const { canvas } = this
        if (!canvas) {
            return
        }

        const photoPosition = canvas.getFinalPhotoPosition()
        if (!photoPosition) {
            return
        }

        const zoom = Math.min(maxZoom, photoPosition.zoom * Math.pow(1.01, -event.deltaY))
            // One wheel tick has a deltaY of ~ 4
        if (zoom === photoPosition.zoom) {
            // Nothing to do
        } else if (zoom < canvas.getMinZoom()) {
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
            // TODO: Show error
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

        if (props.orientation !== prevProps.orientation) {
            canvas.setExifOrientation(props.orientation)
            canvasChanged = true
        }

        if (props.photoWork !== prevProps.photoWork) {
            canvas.setPhotoWork(props.photoWork)
            canvasChanged = true
        }

        if (state.photoPosition !== prevState.photoPosition) {
            canvas.setPhotoPosition(state.photoPosition)
            canvasChanged = true
        }

        if (canvasChanged) {
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
                this.updateCanvas(this.props, this.state)
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
