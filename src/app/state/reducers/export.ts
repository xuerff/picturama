import { Action } from 'app/state/ActionType'
import { OPEN_EXPORT, CLOSE_EXPORT } from 'app/state/actionTypes'
import { ExportState } from 'app/state/StateTypes'


export const exportReducer = (state: ExportState = null, action: Action): ExportState => {
    switch (action.type) {
        case OPEN_EXPORT:
            return {
                sectionId: action.payload.sectionId, 
                photoIds: action.payload.photoIds
            }
        case CLOSE_EXPORT:
            return null
        default:
            return state
    }
}
