import { combineReducers } from 'redux'

import { Device } from '../../../common/models/DataTypes'
import { PhotoId, PhotoType } from '../../../common/models/Photo'
import { Action } from '../ActionType'
import {
    SET_HIGHLIGHTED_PHOTOS, FETCH_TOTAL_PHOTO_COUNT, FETCH_PHOTOS_REQUEST, FETCH_PHOTOS_SUCCESS, FETCH_PHOTOS_FAILURE, CHANGE_PHOTOS, EMPTY_TRASH,
    FETCH_DATES, FETCH_TAGS, CREATE_TAGS, INIT_DEVICES, ADD_DEVICE, REMOVE_DEVICE
} from '../actionTypes'
import { TagId, TagType } from '../../../common/models/Tag'
import { cloneArrayWithItemRemoved } from '../../../common/util/LangUtil'


export type FilterState = {
    readonly mainFilter:
        { readonly type: 'date', readonly date: string } |
        { readonly type: 'tag', readonly tagId: TagId } |
        { readonly type: 'trash' } |
        { readonly type: 'processed' } |
        null
    readonly showOnlyFlagged: boolean
}

const initialFilterState: FilterState = {
    mainFilter: null,
    showOnlyFlagged: false,
}

const filter = (state: FilterState = initialFilterState, action: Action): FilterState => {
    switch (action.type) {
        case FETCH_PHOTOS_REQUEST:
            if (action.payload.newFilter) {
                return action.payload.newFilter
            } else {
                return state
            }
        default:
            return state
    }
}


type TagsState = TagType[]

const tags = (state: TagsState = [], action: Action): TagsState => {
    switch (action.type) {
        case FETCH_TAGS:
            return [ ...action.payload.tags ]
        case CREATE_TAGS: {
            const prevTags = state
            let nextTags = [ ...prevTags ]
            for (const newTag of action.payload.tags) {
                let exists = false
                for (const prevTag of prevTags) {
                    if (newTag.slug === prevTag.slug) {
                        exists = true
                        break
                    }
                }

                if (!exists) {
                    nextTags.push(newTag)
                }
            }

            return nextTags
        }
        default:
            return state
    }
}


type DevicesState = Device[]

const devices = (state: DevicesState = [], action: Action): DevicesState => {
    switch (action.type) {
        case INIT_DEVICES:
            return [ ...action.payload.devices ]
        case ADD_DEVICE:
            return [
                ...state,
                action.payload.device
            ]
        case REMOVE_DEVICE:
            return cloneArrayWithItemRemoved(state, action.payload.device, 'id')
        default:
            return state
    }
}


export type DatesState = {
    readonly years: {
        /** E.g. '2018' or 'Invalid date' */
        readonly id: string
        readonly months: {
            /** E.g. '06' or 'Invalid date' */
            readonly id: string
            readonly days: {
                /** E.g. '2018-06-23' or 'Invalid date' */
                readonly id: string
            }[]
        }[]
    }[]
}

const initialDatesState: DatesState = { years: [] }

const dates = (state: DatesState = initialDatesState, action: Action): DatesState => {
    switch (action.type) {
        case FETCH_DATES:
            return action.payload.dates
        default:
            return state
    }
}


export type PhotoData = { [index: string]: PhotoType }
type PhotosState = {
    readonly isFetching: boolean
    readonly fetchError: Error | null
    /** The number of photos with the current filter applied */
    readonly count: number
    /** The total number of photos (when no filter is applied) */
    readonly totalCount: number
    readonly ids: PhotoId[]
    readonly highlightedIds: PhotoId[]
    readonly data: PhotoData
}

const initialPhotosState: PhotosState = {
    isFetching: false,
    fetchError: null,
    count: 0,
    totalCount: 0,
    ids: [],
    highlightedIds: [],
    data: {}
}

const photos = (state: PhotosState = initialPhotosState, action: Action): PhotosState => {
    switch (action.type) {
        case FETCH_TOTAL_PHOTO_COUNT:
            return {
                ...state,
                totalCount: action.payload.totalPhotoCount
            }
        case FETCH_PHOTOS_REQUEST:
            return {
                ...state,  // We keep the old photos while loading
                isFetching: true,
                fetchError: null
            }
        case FETCH_PHOTOS_SUCCESS: {
            let ids = []
            let data = {}
            for (const photo of action.payload.photos) {
                ids.push(photo.id)
                data[photo.id] = photo
            }

            return {
                ...state,
                isFetching: false,
                fetchError: null,
                count: action.payload.photosCount,
                ids,
                highlightedIds: [],
                data
            }
        }
        case FETCH_PHOTOS_FAILURE:
            return {
                ...state,  // We keep the old photos
                isFetching: false,
                fetchError: action.payload
            }
        case CHANGE_PHOTOS:
            return {
                ...state,
                data: updatePhotoData(action.payload.photos, state.data)
            }
        case EMPTY_TRASH: {
            const trashedPhotoIds = action.payload.trashedPhotoIds
            let newData = { ...state.data }
            for (const photoId of trashedPhotoIds) {
                delete newData[photoId]
            }
            return {
                ...state,
                ids: state.ids.filter(photoId => trashedPhotoIds.indexOf(photoId) === -1),
                highlightedIds: state.highlightedIds.filter(photoId => trashedPhotoIds.indexOf(photoId) === -1),
                data: newData
            }
        }
        case SET_HIGHLIGHTED_PHOTOS:
            return {
                ...state,
                highlightedIds: [ ...action.payload.highlightedIds ]
            }
        default:
            return state
    }
}

function updatePhotoData(updatedPhotos: PhotoType[], data: PhotoData): PhotoData {
    let newData
    for (const updatedPhoto of updatedPhotos) {
        if (data[updatedPhoto.id]) {
            if (!newData) {
                newData = { ...data }
            }
            newData[updatedPhoto.id] = updatedPhoto
        }
    }
    return newData || data
}


export type LibraryState = {
    readonly filter: FilterState
    readonly tags: TagsState
    readonly devices: DevicesState
    readonly dates: DatesState
    readonly photos: PhotosState
}

export const library = combineReducers<LibraryState>({
    filter,
    tags,
    devices,
    dates,
    photos
})
