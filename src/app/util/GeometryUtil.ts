import { mat4, vec2 } from 'gl-matrix'

import { round } from 'common/util/LangUtil'

import { Point, Rect, Corner, Size } from './GeometryTypes'


export type Vec2Like = vec2 | [ number, number ]

export const oppositeCorner: { [K in Corner]: Corner } = {
    nw: 'se',
    ne: 'sw',
    sw: 'ne',
    se: 'nw'
}

export function toVec2(point: Vec2Like | Point): vec2 {
    if (isVec2(point)) {
        return point
    } else if (isPoint(point)) {
        return vec2.fromValues(point.x, point.y)
    } else {
        return vec2.fromValues(point[0], point[1])
    }
}

export function isVec2(obj: Vec2Like | Point | null | undefined): obj is vec2 {
    return obj instanceof Float32Array && obj.length === 2
}

export function isVec2Like(obj: Vec2Like | Point | null | undefined): obj is Vec2Like {
    return !!obj && obj['length'] === 2 && typeof obj[0] === 'number' && typeof obj[1] === 'number'
}

export function isPoint(obj: Vec2Like | Point | null | undefined): obj is Point {
    return !!obj && typeof obj['x'] === 'number' && typeof obj['y'] === 'number'
}

export function roundVec2(vector: Vec2Like, fractionDigits: number = 0): vec2 {
    return vec2.fromValues(
        round(vector[0], fractionDigits),
        round(vector[1], fractionDigits)
    )
}

export function roundRect(rect: Rect, fractionDigits: number = 0): Rect {
    return {
        x: round(rect.x, fractionDigits),
        y: round(rect.y, fractionDigits),
        width: round(rect.width, fractionDigits),
        height: round(rect.height, fractionDigits)
    }
}

export function transformRect(rect: Rect, matrix: mat4): Rect {
    const point1 = cornerPointOfRect(rect, 'nw')
    vec2.transformMat4(point1, point1, matrix)
    const point2 = cornerPointOfRect(rect, 'se')
    vec2.transformMat4(point2, point2, matrix)
    return rectFromPoints(point1, point2)
}

export function rectFromPoints(point1: Vec2Like, point2: Vec2Like): Rect {
    return {
        x: Math.min(point1[0], point2[0]),
        y: Math.min(point1[1], point2[1]),
        width: Math.abs(point1[0] - point2[0]),
        height: Math.abs(point1[1] - point2[1])
    }
}

export function rectFromCenterAndSize(center: Vec2Like, size: Size): Rect {
    const width = Math.abs(size.width)
    const height = Math.abs(size.height)
    return {
        x: center[0] - width / 2,
        y: center[1] - height / 2,
        width,
        height
    }
}

export function rectFromCornerPointAndSize(cornerPoint: Vec2Like, size: Size): Rect {
    return {
        x: size.width > 0 ? cornerPoint[0] : cornerPoint[0] + size.width,
        y: size.height > 0 ? cornerPoint[1] : cornerPoint[1] + size.height,
        width: Math.abs(size.width),
        height: Math.abs(size.height)
    }
}

export function centerOfRect(rect: Rect): vec2 {
    return vec2.fromValues(rect.x + rect.width / 2, rect.y + rect.height / 2)
}

export function cornerPointOfRect(rect: Rect, corner: Corner): vec2 {
    const x = (corner === 'nw' || corner === 'sw') ? rect.x : (rect.x + rect.width)
    const y = (corner === 'nw' || corner === 'ne') ? rect.y : (rect.y + rect.height)
    return vec2.fromValues(x, y)
}

export function scaleSize(size: Size, factor: number): Size {
    if (factor === 1) {
        return size
    } else {
        return { width: size.width * factor, height: size.height * factor }
    }
}

export function directionOfPoints(start: Vec2Like, end: Vec2Like): vec2 {
    return vec2.fromValues(end[0] - start[0], end[1] - start[1])
}

export function intersectLines(start1: Vec2Like, direction1: Vec2Like, start2: Vec2Like, direction2: Vec2Like, outFactors: number[]) {
    intersectLinesPlain(start1[0], start1[1], direction1[0], direction1[1], start2[0], start2[1], direction2[0], direction2[1], outFactors)
}

export function intersectLinesPlain(startX1: number, startY1: number, directionX1: number, directionY1: number,
    startX2: number, startY2: number, directionX2: number, directionY2: number, outFactors: number[])
{
    const f = directionX2*directionY1 - directionX1*directionY2
    if (f == 0) {
        outFactors[0] = NaN
        outFactors[1] = NaN
    } else {
        const vX3 = startX2 - startX1, vY3 = startY2 - startY1
        outFactors[0] = (directionX2*vY3 - vX3*directionY2)/f
        outFactors[1] = (directionX1*vY3 - vX3*directionY1)/f
    }
}

export function isPointInPolygon(point: Vec2Like, polygonPoints: Vec2Like[]): boolean {
    // Original code from: https://github.com/substack/point-in-polygon/blob/master/index.js
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html

    let x = point[0], y = point[1]

    let inside = false
    for (let i = 0, j = polygonPoints.length - 1; i < polygonPoints.length; j = i++) {
        const xi = polygonPoints[i][0], yi = polygonPoints[i][1]
        const xj = polygonPoints[j][0], yj = polygonPoints[j][1]

        const intersect = ((yi > y) != (yj > y)) &&
            (x < (xj - xi) * (y - yi) / (yj - yi) + xi)
        if (intersect) inside = !inside
    }

    return inside
}

/**
 * Finds the nearest point on a polyline.
 */
export function nearestPointOnPolygon(point: Vec2Like, polygonPoints: Vec2Like[]): vec2 {
    let minSquareDistance: number | null = null
    let bx: number, by: number, vx: number, vy: number, t: number, nx: number, ny: number, distX: number, distY: number,
        squareDistance: number, nearestX = 0, nearestY = 0, nearestSegmentIndex = 0

    const polygonSize = polygonPoints.length
    for (let i = 0, j = polygonSize - 1; i < polygonSize; j = i++) {
        const segmentStart = polygonPoints[i]
        const segmentEnd = polygonPoints[j]

        bx = segmentEnd[0] - segmentStart[0]
        by = segmentEnd[1] - segmentStart[1]
        if (bx == 0 && by == 0) {
            // This segment has the same start and end point
            // -> Ignore it (and avoid division by 0)
            continue
        }
        vx = point[0] - segmentStart[0]
        vy = point[1] - segmentStart[1]
        t = (vx*bx + vy*by) / (bx*bx + by*by)
        if (t <= 0) {
            nx = segmentStart[0]
            ny = segmentStart[1]
        } else if (t >= 1) {
            nx = segmentEnd[0]
            ny = segmentEnd[1]
        } else {
            nx = segmentStart[0] + t*bx
            ny = segmentStart[1] + t*by
        }
        distX = point[0] - nx
        distY = point[1] - ny
        squareDistance = distX*distX + distY*distY
        if (minSquareDistance == null || squareDistance < minSquareDistance) {
            minSquareDistance = squareDistance
            nearestX = nx
            nearestY = ny
            nearestSegmentIndex = i
        }
    }

    return vec2.fromValues(nearestX, nearestY)
}

export function intersectLineWithPolygon(lineStart: Vec2Like, lineDirection: Vec2Like, polygonPoints: Vec2Like[]): number[] {
    const result: number[] = []

    const intersectOutFactors: number[] = []
    const polygonSize = polygonPoints.length
    for (let i = 0, j = polygonSize - 1; i < polygonSize; j = i++) {
        const segmentStart = polygonPoints[i]
        const segmentEnd = polygonPoints[j]
        const segmentDirection = directionOfPoints(segmentStart, segmentEnd)
        intersectLines(segmentStart, segmentDirection, lineStart, lineDirection, intersectOutFactors)
        if (intersectOutFactors[0] >= 0 && intersectOutFactors[0] <= 1) {
            // The line cuts this segment
            result.push(intersectOutFactors[1])
        }
    }

    result.sort(compareNumbers)
    return result
}

function compareNumbers(a: number, b: number): number {
    return a - b
}
