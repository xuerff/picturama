export function parseImageDataUrl(dataUrl: string): Buffer {
    // Example data URL: 'data:image/webp;base64,UklG...'
    const dataPrefix = 'base64,'
    const base64Data = dataUrl.substr(dataUrl.indexOf(dataPrefix) + dataPrefix.length)
    return new Buffer(base64Data, 'base64')
}
