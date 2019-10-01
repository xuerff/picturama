import { mat4, vec2 } from 'gl-matrix'

import { round } from 'common/util/LangUtil'

import { Point, Rect, Corner } from './GeometryTypes'


export type Vec2Like = vec2 | [ number, number ]

export const oppositeCorner: { [K in Corner]: Corner } = {
    nw: 'se',
    ne: 'sw',
    sw: 'ne',
    se: 'nw'
}

export const horizontalAdjacentCorner: { [K in Corner]: Corner } = {
    nw: 'ne',
    ne: 'nw',
    sw: 'se',
    se: 'sw'
}

export const verticalAdjacentCorner: { [K in Corner]: Corner } = {
    nw: 'sw',
    ne: 'se',
    sw: 'nw',
    se: 'ne'
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

export function transformRect(rect: Rect, matrix: mat4): Rect {
    const point1 = getCornerPointOfRect(rect, 'nw')
    vec2.transformMat4(point1, point1, matrix)
    const point2 = getCornerPointOfRect(rect, 'se')
    vec2.transformMat4(point2, point2, matrix)
    return getRectFromPoints(point1, point2)
}

export function getRectFromPoints(point1: Vec2Like, point2: Vec2Like): Rect {
    return {
        x: Math.min(point1[0], point2[0]),
        y: Math.min(point1[1], point2[1]),
        width: Math.abs(point1[0] - point2[0]),
        height: Math.abs(point1[1] - point2[1])
    }
}

export function getCornerPointOfRect(rect: Rect, corner: Corner): vec2 {
    const x = (corner === 'nw' || corner === 'sw') ? rect.x : (rect.x + rect.width)
    const y = (corner === 'nw' || corner === 'ne') ? rect.y : (rect.y + rect.height)
    return vec2.fromValues(x, y)
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

export function isVectorInPolygon(point: Vec2Like, polygonPoints: Vec2Like[]): boolean {
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

const epsilon = 0.0000001

/**
 * Returns the first cut point of a line with a polygon.
 * If `lineStart` is in the polygon, this is the point where the line hits the polygon for the first time when going
 * from `lineStart` to `lineEnd` and beyond.
 * If `lineStart` is outside the polygon, this is the first cut point before `lineStart`.
 * Returns `null` if the line doesn't hit the polygon at all.
 */
export function cutLineWithPolygon(lineStart: Vec2Like, lineDirection: Vec2Like, polygonPoints: Vec2Like[],
    outFactor?: number[]): vec2 | null
{
    let bestFactor: number | null = null
    const outFactors: number[] = []
    const polygonSize = polygonPoints.length
    for (let i = 0, j = polygonSize - 1; i < polygonSize; j = i++) {
        const segmentStart = polygonPoints[i]
        const segmentEnd = polygonPoints[j]
        const segmentDirection = directionOfPoints(segmentStart, segmentEnd)
        intersectLines(segmentStart, segmentDirection, lineStart, lineDirection, outFactors)
        if (outFactors[0] >= 0 && outFactors[0] <= 1) {
            // The line cuts this segment
            if (bestFactor === null || ((outFactors[1] >= epsilon && bestFactor >= epsilon) ? outFactors[1] < bestFactor : outFactors[1] > bestFactor)) {
                bestFactor = outFactors[1]
            }
        }
    }

    if (outFactor) {
        outFactor[0] = (bestFactor === null) ? NaN : bestFactor
    }

    if (bestFactor === null) {
        return null
    } else {
        return vec2.fromValues(
            lineStart[0] + bestFactor * lineDirection[0],
            lineStart[1] + bestFactor * lineDirection[1]
        )
    }
}
