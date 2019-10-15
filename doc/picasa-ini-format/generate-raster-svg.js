// Generates a svg with a raster showing up 50 px blocks (black) as well as the center (blue), the top/left quarter (red)
// and the bottom/right quarter (magenta). Each 50 px block has a 25 px center line (gray) and every 2 px a sub line (light gray).

// Width and height must be devideable by 4 and by 50
const width = 800
const height = 600

const testCropRect = [
    [100,200],
    [520,270],   // 100+70*6, 100+70
    [490,450],   // 520-30,   270+30*6
    [70,380]    // 490-70*6, 450-70
]


function renderRasterPath(stepSize, useStep, color) {
    let path = []
    for (let x = 0; x <= width; x += stepSize) {
        if (useStep(x, width)) {
            path.push(`M${x-0.5},0 l0,${height}`)
        }
    }
    for (let y = 0; y <= height; y += stepSize) {
        if (useStep(y, height)) {
            path.push(`M0,${y-0.5} l${width},0`)
        }
    }
    console.log(`  <path d="${path.join(' ')}" stroke="${color}" stroke-width="1" fill="none"/>`)
}


console.log(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">`)
console.log(`  <rect x="0" y="0" width="${width}" height="${height}" fill="white"/>`)
renderRasterPath(5, (step, max) => step % 25 !== 0, "#ccc")
renderRasterPath(25, (step, max) => step % 50 !== 0, "#888")
renderRasterPath(50, (step, max) => step % (max / 4) !== 0 || step === max, "black")
console.log(`  <path d="M${width * 3/4 - 0.5},0 l0,${height} M0,${height * 3/4 - 0.5} l${width},0" stroke="magenta" stroke-width="1" fill="none"/>`)
console.log(`  <path d="M${width / 4 - 0.5},0 l0,${height} M0,${height / 4 - 0.5} l${width},0" stroke="red" stroke-width="1" fill="none"/>`)
console.log(`  <path d="M${width / 2 - 0.5},0 l0,${height} M0,${height / 2 - 0.5} l${width},0" stroke="blue" stroke-width="1" fill="none"/>`)
if (testCropRect) {
    console.log(`  <path d="M${testCropRect.map(point => `${point[0]-0.5},${point[1]-0.5}`).join(' L')} Z" stroke="green" stroke-width="1" fill="none"/>`)
}
console.log('</svg>')
