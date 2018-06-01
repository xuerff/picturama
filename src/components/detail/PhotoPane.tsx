import * as classNames from 'classnames'
import * as React from 'react'
import { findDOMNode } from 'react-dom'
import { mat4 } from 'gl-matrix'

import { ExifOrientation } from '../../models/DataTypes'
import { PhotoWork } from '../../models/Photo'
import PhotoCanvas from '../../renderer/PhotoCanvas'
import { Texture } from '../../renderer/WebGLCanvas'
import CancelablePromise, { isCancelError } from '../../util/CancelablePromise'


const textureCacheMaxSize = 5


interface TextureInfo {
    src: string
    texture: Texture
    lastUse: number
}


interface Props {
    className?: any
    style?: any
    width: number
    height: number
    src: string
    srcPrev?: string
    srcNext?: string
    orientation: ExifOrientation
    photoWork?: PhotoWork
    setLoading: (loading: boolean) => void
}

interface State {
}

export default class PhotoPane extends React.Component<Props, State> {

    private canvas: PhotoCanvas | null = null

    private isLoadingTexture = false
    private canvasSrc: string | null = null
    private textureCache: { [key:string]: TextureInfo } = {}


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

        this.tryToFetchTexture(props.src)
        this.tryToFetchTexture(props.srcNext)
        this.tryToFetchTexture(props.srcPrev)

        let textureChanged = false
        if (this.canvasSrc !== props.src) {
            let textureToShow = null
            const textureInfo = this.textureCache[props.src]
            if (textureInfo) {
                textureInfo.lastUse = Date.now()
                textureToShow = textureInfo.texture
            }
            canvas.setBaseTexture(textureToShow, false)
            this.canvasSrc = textureToShow ? props.src : null
            textureChanged = true
            this.props.setLoading(textureToShow === null)
        }

        if (textureChanged || props.width !== prevProps.width || props.height !== prevProps.height || props.orientation !== prevProps.orientation
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

    tryToFetchTexture(src?: string) {
        const { textureCache } = this

        if (!src || textureCache[src] || this.isLoadingTexture) {
            return
        }

        this.isLoadingTexture = true
        this.canvas.createTextureFromSrc(src)
            .then(texture => {
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
                    oldestTextureInfo.texture.destroy()
                    delete textureCache[oldestTextureInfo.src]
                }

                this.isLoadingTexture = false
                this.updateCanvas(this.props)
            })
            .catch(error => {
                this.isLoadingTexture = false
                console.error(`Loading ${src} failed`, error)
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
