import { ImportProgress } from 'common/CommonTypes'

import { Action } from 'ui/state/ActionType'
import { START_IMPORT, SET_IMPORT_PROGRESS, FETCH_SECTIONS_SUCCESS, FETCH_SECTIONS_FAILURE } from 'ui/state/actionTypes'


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
        case FETCH_SECTIONS_SUCCESS:
        case FETCH_SECTIONS_FAILURE:
            return null
        default:
            return state
    }
}
