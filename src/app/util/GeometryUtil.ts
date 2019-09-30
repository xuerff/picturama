import { mat4, vec2 } from 'gl-matrix'

import { round } from 'common/util/LangUtil'

import { Point, Rect, Corner } from './GeometryTypes'


export const oppositeCorner: { [K in Corner]: Corner } = {
    nw: 'se',
    ne: 'sw',
    sw: 'ne',
    se: 'nw'
}

export function roundPoint(point: Point, fractionDigits: number = 0): Point {
    return {
        x: round(point.x, fractionDigits),
        y: round(point.y, fractionDigits)
    }
}

export function transformRect(rect: Rect, matrix: mat4): Rect {
    const vector1 = getCornerVectorOfRect(rect, 'nw')
    vec2.transformMat4(vector1, vector1, matrix)
    const vector2 = getCornerVectorOfRect(rect, 'se')
    vec2.transformMat4(vector2, vector2, matrix)
    return getRectFromVectors(vector1, vector2)
}

export function transformPoint(point: Point, matrix: mat4): Point {
    const vec = vec2.fromValues(point.x, point.y)
    vec2.transformMat4(vec, vec, matrix)
    return { x: vec[0], y: vec[1] }
}

export function getRectFromPoints(point1: Point, point2: Point): Rect {
    return {
        x: Math.min(point1.x, point2.x),
        y: Math.min(point1.y, point2.y),
        width: Math.abs(point1.x - point2.x),
        height: Math.abs(point1.y - point2.y)
    }
}

export function getRectFromVectors(vector1: vec2, vector2: vec2): Rect {
    return {
        x: Math.min(vector1[0], vector2[0]),
        y: Math.min(vector1[1], vector2[1]),
        width: Math.abs(vector1[0] - vector2[0]),
        height: Math.abs(vector1[1] - vector2[1])
    }
}

export function getCornerPointOfRect(rect: Rect, corner: Corner): Point {
    const x = (corner === 'nw' || corner === 'sw') ? rect.x : (rect.x + rect.width)
    const y = (corner === 'nw' || corner === 'ne') ? rect.y : (rect.y + rect.height)
    return { x, y }
}

export function getCornerVectorOfRect(rect: Rect, corner: Corner): vec2 {
    const x = (corner === 'nw' || corner === 'sw') ? rect.x : (rect.x + rect.width)
    const y = (corner === 'nw' || corner === 'ne') ? rect.y : (rect.y + rect.height)
    return vec2.fromValues(x, y)
}
