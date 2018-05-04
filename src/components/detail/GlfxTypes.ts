// glfx.js API:
//   - API docs (from older version): http://evanw.github.io/glfx.js/docs/
//   - In source: `node_modules/glfx-js/glfx.js` starting at line 305
export interface GlfxCanvas {
    // Core methods
    texture(image: HTMLImageElement): GlfxTexture
    initialize(width: number, height: number)
    draw(texture: GlfxTexture, width?: number, height?: number): GlfxCanvas
    update(): GlfxCanvas
    // TODO: replace
    // TODO: contents
    // TODO: getPixelArray

    // Filter methods
    // TODO: brightnessContrast
    // TODO: hexagonalPixelate
    // TODO: hueSaturation
    // TODO: colorHalftone
    // TODO: triangleBlur
    // TODO: fastBlur
    // TODO: unsharpMask
    // TODO: perspective
    // TODO: matrixWarp
    // TODO: bulgePinch
    // TODO: tiltShift
    // TODO: dotScreen
    // TODO: edgeWork
    // TODO: lensBlur
    // TODO: erode
    // TODO: dilate
    // TODO: zoomBlur
    // TODO: noise
    // TODO: denoise
    // TODO: curves
    // TODO: swirl
    // TODO: ink
    // TODO: vignette
    // TODO: vibrance
    // TODO: sepia
    // dronus' filter methods
    // TODO: capture
    // TODO: video
    // TODO: stack_prepare
    // TODO: stack_push
    // TODO: stack_pop
    // TODO: stack_swap
    // TODO: blend
    // TODO: blend_alpha
    // TODO: colorkey
    // TODO: lumakey
    // TODO: displacement
    // TODO: mesh_displacement
    // TODO: patch_displacement
    // TODO: particles
    // TODO: posterize
    // TODO: superquadric
    // TODO: supershape
    // TODO: feedbackIn
    // TODO: feedbackOut
    // TODO: grid
    // TODO: kaleidoscope
    // TODO: tile
    // TODO: denoisefast
    // TODO: localContrast
    // TODO: preview
    // TODO: life
    // TODO: smoothlife
    // TODO: ripple
    // TODO: colorDisplacement
    // TODO: analogize
    // TODO: motion
    // TODO: gauze
    // TODO: mandelbrot
    // TODO: timeshift
    // TODO: reaction
    // TODO: relief

    /**
     * @param x the x translation (from 0 = left to 1 = right)
     * @param y the y translation (from 0 = bottom to 1 = top)
     */
    transform(x: number, y: number, scale: number, angle: number)

    // TODO: polygon
    // TODO: matte
    // TODO: waveform
    // TODO: spectrogram
    // hexapode's filters methods
    // TODO: color
    // TODO: levels
    // TODO: absolute
    // TODO: rainbow
    // TODO: sobel
    // TODO: toHSV
    // TODO: invertColor
    // TODO: noalpha
    // TODO: mirror
}

export interface GlfxCanvasElement extends GlfxCanvas, HTMLCanvasElement {}

export interface GlfxTexture {
    destroy()
}

export interface Glfx {
    // In source: `node_modules/glfx-js/glfx.js` starting at line 282
    // Canvas2DContextAttributes see: https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/getContext
    canvas: (options?: Canvas2DContextAttributes) => GlfxCanvasElement
}
