
export interface Point {
    x: number
    y: number
}

export interface Size {
    width: number
    height: number
}
export const zeroSize: Size = { width: 0, height: 0 }

export type Rect = Point & Size
export const zeroRect: Rect = { x: 0, y: 0, width: 0, height: 0 }

export type Corner = 'nw' | 'ne' | 'sw' | 'se'
export const corners: Corner[] = [ 'nw', 'ne', 'sw', 'se' ]
