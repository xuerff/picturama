import { ImportProgress } from 'common/CommonTypes'

import { Action } from 'app/state/ActionType'
import { SET_IMPORT_PROGRESS, FETCH_SECTIONS_SUCCESS, FETCH_SECTIONS_FAILURE } from 'app/state/actionTypes'


export type ImportState = {
    readonly progress: ImportProgress
} | null

export const importReducer = (state: ImportState = null, action: Action): ImportState => {
    switch (action.type) {
        case SET_IMPORT_PROGRESS:
            if (action.payload) {
                return {
                    progress: action.payload
                }
            } else {
                return null
            }
        default:
            return state
    }
}
