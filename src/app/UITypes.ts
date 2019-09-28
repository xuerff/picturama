export enum FetchState { IDLE, FETCHING, FAILURE }

export type DateTree = { years: { id: string, months: { id: string, days: { id: string }[] }[] }[] }

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

/** The result of 'justified-layout' */
export interface JustifiedLayoutResult {
    containerHeight: number
    widowCount: number
    boxes: JustifiedLayoutBox[]
}
export interface JustifiedLayoutBox {
    aspectRatio: number
    left: number
    top: number
    width: number
    height: number
}

export interface GridSectionLayout {
    sectionTop: number
    containerHeight: number
    /** The index of the first photo to render (inclusive) */
    fromBoxIndex?: number
    /** The index of the last photo to render (exclusive) */
    toBoxIndex?: number
    boxes?: JustifiedLayoutBox[]
}

export interface GridLayout {
    /** The index of the first section to render (inclusive) */
    fromSectionIndex: number
    /** The index of the last section to render (exclusive) */
    toSectionIndex: number
    sectionLayouts: GridSectionLayout[]
}
