import { combineReducers } from 'redux'

import { PhotoId, PhotoSectionId, PhotoFilter } from '../../../common/models/Photo'
import { Action } from '../ActionType'
import { SET_SELECTED_PHOTOS, FETCH_SECTIONS_REQUEST, FETCH_SECTIONS_SUCCESS, FETCH_SECTIONS_FAILURE, EMPTY_TRASH } from '../actionTypes'


const initialFilterState: PhotoFilter = {
    mainFilter: null,
    showOnlyFlagged: false,
}

const filter = (state: PhotoFilter = initialFilterState, action: Action): PhotoFilter => {
    switch (action.type) {
        case FETCH_SECTIONS_REQUEST:
            if (action.payload.newFilter) {
                return action.payload.newFilter
            } else {
                return state
            }
        default:
            return state
    }
}


type SelectionState = {
    readonly sectionId: PhotoSectionId | null
    readonly photoIds: PhotoId[]
}

const initialSelectionState: SelectionState = {
    sectionId: null,
    photoIds: []
}

const selection = (state: SelectionState = initialSelectionState, action: Action): SelectionState => {
    switch (action.type) {
        case FETCH_SECTIONS_SUCCESS:
        case FETCH_SECTIONS_FAILURE:
            return initialSelectionState
        case EMPTY_TRASH: {
            const trashedPhotoIds = action.payload.trashedPhotoIds
            return {
                ...state,
                photoIds: state.photoIds.filter(photoId => trashedPhotoIds.indexOf(photoId) === -1)
            }
        }
        case SET_SELECTED_PHOTOS:
            return {
                sectionId: action.payload.sectionId,
                photoIds: [ ...action.payload.photoIds ]
            }
        default:
            return state
    }
}


export type LibraryState = {
    readonly filter: PhotoFilter
    readonly selection: SelectionState
}

export const library = combineReducers<LibraryState>({
    filter,
    selection
})
