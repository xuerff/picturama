import { isShallowEqual } from 'common/util/LangUtil'

import PhotoCanvas from 'app/renderer/PhotoCanvas'
import { Texture } from 'app/renderer/WebGLCanvas'
import Profiler from 'common/util/Profiler'


interface TextureInfo {
    src: string
    texture: Texture
    lastUse: number
}

export interface TextureCacheOptions {
    canvas: PhotoCanvas
    maxCacheSize: number
    profile?: boolean
    /**
     * Will be called when a texture was fetched (or fetching failed)
     *
     * @param src The fetched source
     * @param texture The texture - is `null` if fetching failed
     */
    onTextureFetched(src: string, texture: Texture | null): void
}

export default class TextureCache {

    private sourcesToFetch: (string | null)[]
    private isLoadingTexture = false
    private texturesWithError: { [key: string]: true } = {}
    private textureCache: { [key: string]: TextureInfo } = {}


    constructor(private options: TextureCacheOptions) {
        this.sourcesToFetch = []
    }

    setSourcesToFetch(sourcesToFetch: (string | null)[]) {
        if (sourcesToFetch.length > this.options.maxCacheSize) {
            throw new Error(`sourcesToFetch (${sourcesToFetch.length}) exceeds maxCacheSize (${this.options.maxCacheSize})`)
        }

        if (isShallowEqual(sourcesToFetch, this.sourcesToFetch)) {
            return
        }

        this.texturesWithError = {}
        this.sourcesToFetch = sourcesToFetch
        this.tryToFetchTextures()
    }

    hasTextureError(src: string): boolean {
        return this.texturesWithError[src] || false
    }

    getTexture(src: string): Texture | null {
        const textureInfo = this.textureCache[src]
        if (textureInfo) {
            textureInfo.lastUse = Date.now()
            return textureInfo.texture
        } else {
            return null
        }
    }

    private tryToFetchTextures() {
        for (const src of this.sourcesToFetch) {
            this.tryToFetchTexture(src)
        }
    }

    private tryToFetchTexture(src?: string | null) {
        const { textureCache } = this
        const { canvas } = this.options

        if (!src || this.isLoadingTexture || textureCache[src] || this.texturesWithError[src]) {
            return
        }

        const profiler = this.options.profile ? new Profiler(`Fetching texture for ${src}`) : null
        this.isLoadingTexture = true
        canvas.createTextureFromSrc(src, profiler)
            .then(texture => {
                if (profiler) profiler.addPoint('Loaded texture')
                textureCache[src] = { src, texture, lastUse: Date.now() }

                const cachedSrcs = Object.keys(textureCache)
                if (cachedSrcs.length > this.options.maxCacheSize) {
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
                    if (profiler) profiler.addPoint('Removed obsolete textures from cache')
                }

                this.isLoadingTexture = false
                this.options.onTextureFetched(src, texture)
                if (profiler) profiler.addPoint('Called onTextureProcessed')

                if (profiler) profiler.logResult()
            })
            .catch(error => {
                console.error(`Loading ${src} failed`, error)
                this.isLoadingTexture = false
                this.texturesWithError[src] = true
                this.options.onTextureFetched(src, null)
            })
            .then(() => {
                this.tryToFetchTextures()
            })
    }

}
