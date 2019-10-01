import { vec2 } from 'gl-matrix'

import { createDragRectFencePolygon } from 'app/ui/detail/CropModeUtil'


test('test createDragRectFencePolygon', () => {
    // Test a rect in a polygon which is not tilted
    expect(createDragRectFencePolygon(
        { x: 2, y: 2, width: 2, height: 1 },
        [ [1,1], [6,1], [6,5], [1,5] ]))
        .toEqual([ vec2.fromValues(1,1), vec2.fromValues(4,1), vec2.fromValues(4,4), vec2.fromValues(1,4) ])

    // Test a rect in a polygon tilted by 45°
    expect(createDragRectFencePolygon(
        { x: 3, y: 2, width: 1, height: 2 },
        [ [3,0], [7,4], [4,7], [0,3] ]))
        .toEqual([ vec2.fromValues(2.5,0.5), vec2.fromValues(5,3), vec2.fromValues(3.5,4.5), vec2.fromValues(1,2) ])
})
