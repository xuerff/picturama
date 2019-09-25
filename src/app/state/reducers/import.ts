import { Action } from 'app/state/ActionType'
import { SET_IMPORT_PROGRESS } from 'app/state/actionTypes'
import { ImportState } from 'app/state/StateTypes'


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
