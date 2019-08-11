import { PhotoId, PhotoSectionId } from 'common/CommonTypes'

import { Action } from 'ui/state/ActionType'
import { OPEN_EXPORT, CLOSE_EXPORT } from 'ui/state/actionTypes'


export type ExportState = {
    readonly sectionId: PhotoSectionId
    readonly photoIds: PhotoId[]
} | null

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
