export enum FetchState { IDLE, FETCHING, FAILURE }


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
    containerHeight: number
    /** The index of the first photo to render (inclusive) */
    fromBoxIndex?: number
    /** The index of the last photo to render (exclusive) */
    toBoxIndex?: number
    boxes?: JustifiedLayoutBox[]
}
