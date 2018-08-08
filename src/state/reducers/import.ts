import { Action } from '../ActionType'
import { START_IMPORT, SET_IMPORT_PROGRESS, FETCH_PHOTOS_SUCCESS, FETCH_PHOTOS_FAILURE } from '../actionTypes'


export type ImportProgress = {
    readonly processed: number
    readonly total: number
    readonly photosDir: string | null
}

export type ImportState = {
    readonly progress: ImportProgress
} | null

export const importReducer = (state: ImportState = null, action: Action): ImportState => {
    switch (action.type) {
        case START_IMPORT:
            return {
                progress: {
                    processed: 0,
                    total: 0,
                    photosDir: null
                }
            }
        case SET_IMPORT_PROGRESS:
            return {
                progress: { ...action.payload.progress }
            }
        case FETCH_PHOTOS_SUCCESS:
        case FETCH_PHOTOS_FAILURE:
            return null
        default:
            return state
    }
}
