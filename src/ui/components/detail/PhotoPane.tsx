import classNames from 'classnames'
import React from 'react'
import { findDOMNode } from 'react-dom'

import { profileDetailView } from '../../../common/LogConstants'
import { ExifOrientation } from '../../../common/models/DataTypes'
import { PhotoWork } from '../../../common/models/Photo'
import PhotoCanvas from '../../renderer/PhotoCanvas'
import { Texture } from '../../renderer/WebGLCanvas'
import Profiler from '../../../common/util/Profiler'

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
}

export default class PhotoPane extends React.Component<Props, State> {

    private canvas: PhotoCanvas | null = null

    private isLoadingTexture = false
    private texturesWithError: { [index: string]: boolean } = {}
    private canvasSrc: string | null = null
    private textureCache: { [key:string]: TextureInfo } = {}
    private deferredHideCanvasTimeout: NodeJS.Timer | null


    constructor(props: Props) {
        super(props)
    }

    componentDidMount() {
        this.canvas = new PhotoCanvas()
        const canvasElem = this.canvas.getElement()
        canvasElem.className = 'PhotoPane-canvas'
        canvasElem.style.display = 'none'
        const mainElem = findDOMNode(this.refs.main) as HTMLDivElement
        mainElem.appendChild(canvasElem)

        this.updateCanvas({})
    }

    componentWillUnmount() {
        if (this.canvas) {
            const canvasElem = this.canvas.getElement()
            canvasElem.parentNode!.removeChild(canvasElem)
            this.canvas = null
        }
    }

    componentDidUpdate(prevProps: Props, prevState: State) {
        this.updateCanvas(prevProps)
    }

    updateCanvas(prevProps: Partial<Props>) {
        const { props, canvas } = this
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
            this.props.setLoading(false)
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

        if (canvasChanged) {
            if (canvas.isValid()) {
                if (this.deferredHideCanvasTimeout) {
                    clearTimeout(this.deferredHideCanvasTimeout)
                    this.deferredHideCanvasTimeout = null
                }
                canvas.update()
                canvas.getElement().style.display = null
                this.props.setLoading(false)
            } else if (!this.deferredHideCanvasTimeout) {
                // We hide the old image of an invalid canvas with a little delay,
                // in order to avoid blinking if loading the next texture and photo work is fast
                this.deferredHideCanvasTimeout = setTimeout(() => {
                    this.deferredHideCanvasTimeout = null
                    canvas.getElement().style.display = 'none'
                    this.props.setLoading(true)
                }, 100)
            }
        }
    }

    tryToFetchTexture(src?: string | null) {
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
                this.updateCanvas(this.props)
                if (profiler) profiler.addPoint('Updated canvas')

                if (profiler) profiler.logResult()
            })
            .catch(error => {
                console.error(`Loading ${src} failed`, error)
                this.isLoadingTexture = false
                this.texturesWithError[src] = true
                this.updateCanvas(this.props)
            })
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
