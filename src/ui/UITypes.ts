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
    boxes?: JustifiedLayoutBox[]
}
