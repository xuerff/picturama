import { mat4, vec2 } from 'gl-matrix'

import { Point, Rect, Corner } from './GeometryTypes'


export function transformRect(rect: Rect, matrix: mat4): Rect {
    const point1 = transformPoint(getCornerPointOfRect(rect, 'nw'), matrix)
    const point2 = transformPoint(getCornerPointOfRect(rect, 'se'), matrix)
    return getRectFromPoints(point1, point2)
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

export function getCornerPointOfRect(rect: Rect, corner: Corner): Point {
    const x = (corner === 'nw' || corner === 'sw') ? rect.x : (rect.x + rect.width)
    const y = (corner === 'nw' || corner === 'ne') ? rect.y : (rect.y + rect.height)
    return { x, y }
}
