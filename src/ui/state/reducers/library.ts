import { combineReducers } from 'redux'

import { PhotoId, PhotoSectionId, PhotoFilter, PhotoDetail } from '../../../common/models/Photo'

import { defaultGridRowHeight } from '../../UiConstants'
import { Action } from '../ActionType'
import {
    SET_GRID_ROW_HEIGHT, SET_SELECTED_PHOTOS, FETCH_SECTIONS_REQUEST, FETCH_SECTIONS_SUCCESS, FETCH_SECTIONS_FAILURE,
    CHANGE_PHOTOS, SET_LIBRARY_INFO_PHOTO_REQUEST, SET_LIBRARY_INFO_PHOTO_SUCCESS, SET_PHOTO_TAGS, EMPTY_TRASH
} from '../actionTypes'


type DisplayState = {
    /** The target row height of the grid. The grid won't hit this value exactly, as it depends on the layout. */
    readonly gridRowHeight: number
}

const initialDisplayState: DisplayState = {
    gridRowHeight: defaultGridRowHeight
}

const display = (state: DisplayState = initialDisplayState, action: Action): DisplayState => {
    switch (action.type) {
        case SET_GRID_ROW_HEIGHT:
            return {
                gridRowHeight: action.payload.gridRowHeight
            }
        default:
            return state
    }
}


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
        case CHANGE_PHOTOS: {
            const removeUpdatedPhotos = action.payload.update.trashed !== undefined
            if (removeUpdatedPhotos) {
                return {
                    sectionId: null,
                    photoIds: []
                }
            } else {
                return state
            }
        }
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


type InfoState = {
    readonly sectionId: PhotoSectionId
    readonly photoId: PhotoId
    /** Is `null` while loading */
    readonly photoDetail: PhotoDetail | null
} | null

const info = (state: InfoState = null, action: Action): InfoState => {
    switch (action.type) {
        case SET_LIBRARY_INFO_PHOTO_REQUEST:
            if (action.payload.sectionId && action.payload.photoId) {
                return {
                    sectionId: action.payload.sectionId,
                    photoId: action.payload.photoId,
                    photoDetail: null
                }
            } else {
                return null
            }
        case SET_LIBRARY_INFO_PHOTO_SUCCESS:
            return state && {
                ...state,
                photoDetail: action.payload.photoDetail
            }
        case SET_PHOTO_TAGS:
            if (state && state.photoId === action.payload.photoId && state.photoDetail) {
                return {
                    ...state,
                    photoDetail: {
                        ...state.photoDetail,
                        tags: action.payload.tags
                    }
                }
            }
        case FETCH_SECTIONS_SUCCESS:
        case FETCH_SECTIONS_FAILURE:
            return null
        default:
            return state
    }
}


export type LibraryState = {
    readonly display: DisplayState
    readonly filter: PhotoFilter
    readonly selection: SelectionState
    readonly info: InfoState
}

export const library = combineReducers<LibraryState>({
    display,
    filter,
    selection,
    info
})
