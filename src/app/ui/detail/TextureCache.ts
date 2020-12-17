import { isShallowEqual } from 'common/util/LangUtil'

import PhotoCanvas from 'app/renderer/PhotoCanvas'
import { Texture } from 'app/renderer/WebGLCanvas'
import Profiler from 'common/util/Profiler'


interface TextureInfo {
    imagePath: string
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
     * @param imagePath The path of the fetched image
     * @param texture The texture - is `null` if fetching failed
     */
    onTextureFetched(imagePath: string, texture: Texture | null): void
}

export default class TextureCache {

    private imagePathsToFetch: (string | null)[]
    private isLoadingTexture = false
    private texturesWithError: { [key: string]: true } = {}
    private textureCache: { [key: string]: TextureInfo } = {}


    constructor(private options: TextureCacheOptions) {
        this.imagePathsToFetch = []
    }

    setImagesToFetch(imagePathsToFetch: (string | null)[]) {
        if (imagePathsToFetch.length > this.options.maxCacheSize) {
            throw new Error(`imagePathsToFetch (${imagePathsToFetch.length}) exceeds maxCacheSize (${this.options.maxCacheSize})`)
        }

        if (isShallowEqual(imagePathsToFetch, this.imagePathsToFetch)) {
            return
        }

        this.texturesWithError = {}
        this.imagePathsToFetch = imagePathsToFetch
        this.tryToFetchTextures()
    }

    hasTextureError(imagePath: string): boolean {
        return this.texturesWithError[imagePath] || false
    }

    getTexture(imagePath: string): Texture | null {
        const textureInfo = this.textureCache[imagePath]
        if (textureInfo) {
            textureInfo.lastUse = Date.now()
            return textureInfo.texture
        } else {
            return null
        }
    }

    private tryToFetchTextures() {
        for (const imagePath of this.imagePathsToFetch) {
            this.tryToFetchTexture(imagePath)
        }
    }

    private tryToFetchTexture(imagePath?: string | null) {
        const { textureCache } = this
        const { canvas } = this.options

        if (!imagePath || this.isLoadingTexture || textureCache[imagePath] || this.texturesWithError[imagePath]) {
            return
        }

        const profiler = this.options.profile ? new Profiler(`Fetching texture for ${imagePath}`) : null
        this.isLoadingTexture = true
        canvas.createTextureFromFile(imagePath, profiler)
            .then(texture => {
                if (profiler) profiler.addPoint('Loaded texture')
                textureCache[imagePath] = { imagePath, texture, lastUse: Date.now() }

                const cachedImagePaths = Object.keys(textureCache)
                if (cachedImagePaths.length > this.options.maxCacheSize) {
                    let oldestTextureInfo: TextureInfo | null = null
                    for (const imagePath of cachedImagePaths) {
                        const textureInfo = textureCache[imagePath]
                        if (!oldestTextureInfo || textureInfo.lastUse < oldestTextureInfo.lastUse) {
                            oldestTextureInfo = textureInfo
                        }
                    }
                    if (oldestTextureInfo) {
                        oldestTextureInfo.texture.destroy()
                        delete textureCache[oldestTextureInfo.imagePath]
                    }
                    if (profiler) profiler.addPoint('Removed obsolete textures from cache')
                }

                this.isLoadingTexture = false
                this.options.onTextureFetched(imagePath, texture)
                if (profiler) profiler.addPoint('Called onTextureProcessed')

                if (profiler) profiler.logResult()
            })
            .catch(error => {
                console.error(`Loading ${imagePath} failed`, error)
                this.isLoadingTexture = false
                this.texturesWithError[imagePath] = true
                this.options.onTextureFetched(imagePath, null)
            })
            .then(() => {
                this.tryToFetchTextures()
            })
    }

}
