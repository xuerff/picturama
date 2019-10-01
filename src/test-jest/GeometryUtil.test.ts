import { intersectPlainLines, cutLineWithPolygon, Vec2Like } from 'app/util/GeometryUtil'
import { vec2 } from 'gl-matrix'


test('test intersectLines', () => {
    const outFactors: number[] = []

    // Test two normal lines
    intersectPlainLines(1,2,5,2, 2,1,2,3, outFactors)
    expect(outFactors.length).toBe(2)
    expect(outFactors[0]).toBe(0.25)
    expect(outFactors[1]).toBe(0.5)

    // Test two lines which don't intersect (expect factors outside 0..1)
    intersectPlainLines(1,2,5,2, 6,3,6,5, outFactors)
    expect(outFactors.length).toBe(2)
    expect(outFactors[0]).toBe(1.25)
    expect(outFactors[1]).toBe(-0.5)

    // Test two parallel lines
    intersectPlainLines(0,0,2,2, 2,1,3,2, outFactors)
    expect(outFactors.length).toBe(2)
    expect(outFactors[0]).toBe(NaN)
    expect(outFactors[1]).toBe(NaN)
})


test('test cutLineWithPolygon', () => {
    const polygon: Vec2Like[] = [
        [1, 1],
        [1, 3],
        [3, 5],
        [5, 1],
    ]

    // Test line inside polygon
    expect(cutLineWithPolygon([2,3], [3,3], polygon)).toEqual(vec2.fromValues(4,3))

    // Test line outside polygon
    expect(cutLineWithPolygon([2,5], [2,7], polygon)).toEqual(vec2.fromValues(2,4))

    // Test line not cutting the polygon
    expect(cutLineWithPolygon([0,0], [3,0], polygon)).toBe(null)

    // Test line intersecting the polygon
    expect(cutLineWithPolygon([2,2], [0,2], polygon)).toEqual(vec2.fromValues(1,2))
})
