import { PhotoId } from '../../models/Photo'
import { Action } from '../ActionType'
import { OPEN_EXPORT, CLOSE_EXPORT } from '../actionTypes'

export type ExportState = {
    readonly photoIds: PhotoId[]
} | null

export const exportReducer = (state: ExportState = null, action: Action): ExportState => {
    switch (action.type) {
        case OPEN_EXPORT:
            return {
                photoIds: action.payload.photoIds
            }
        case CLOSE_EXPORT:
            return null
        default:
            return state
    }
}
