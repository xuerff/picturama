import { PhotoId, PhotoWork, PhotoDetail, PhotoSectionId } from '../../../common/models/Photo'

import { FetchState } from '../../UITypes'
import { Action } from '../ActionType'
import { SET_DETAIL_PHOTO_REQUEST, SET_DETAIL_PHOTO_SUCCESS, SET_DETAIL_PHOTO_FAILURE, CLOSE_DETAIL, CHANGE_PHOTOWORK, FETCH_SECTIONS_SUCCESS, OPEN_DIFF, CLOSE_DIFF, CHANGE_PHOTOS, EMPTY_TRASH } from '../actionTypes'


export type DetailState = {
    readonly showDiff: boolean
    readonly currentPhoto: {
        readonly fetchState: FetchState
        readonly sectionId: PhotoSectionId
        readonly photoIndex: number
        readonly photoId: PhotoId
        /** Is `null` while loading */
        readonly photoDetail: PhotoDetail | null
        /** Is `null` while loading */
        readonly photoWork: PhotoWork | null
    }
} | null

export const detail = (state: DetailState = null, action: Action): DetailState => {
    switch (action.type) {
        case SET_DETAIL_PHOTO_REQUEST:
            return {
                showDiff: false,
                currentPhoto: {
                    fetchState: FetchState.FETCHING,
                    sectionId: action.payload.sectionId,
                    photoIndex: action.payload.photoIndex,
                    photoId: action.payload.photoId,
                    photoDetail: null,
                    photoWork: null
                }
            }
        case SET_DETAIL_PHOTO_SUCCESS:
            return {
                ...state,
                currentPhoto: {
                    ...state.currentPhoto,
                    fetchState: FetchState.IDLE,
                    photoDetail: action.payload.photoDetail,
                    photoWork: action.payload.photoWork
                }
            }
        case SET_DETAIL_PHOTO_FAILURE:
            return {
                ...state,
                currentPhoto: {
                    ...state.currentPhoto,
                    fetchState: FetchState.FAILURE
                }
            }
        case CHANGE_PHOTOWORK:
            if (state && state.currentPhoto.photoId === action.payload.photoId) {
                return {
                    ...state,
                    currentPhoto: {
                        ...state.currentPhoto,
                        photoWork: { ...action.payload.photoWork }
                    }
                }
            } else {
                return state
            }
        case FETCH_SECTIONS_SUCCESS:
        case CLOSE_DETAIL:
            return null
        case CHANGE_PHOTOS: {
            const changedPhoto = action.payload.photos[0]
            if (state && changedPhoto && changedPhoto.trashed) {
                return null
            } else {
                return state
            }
        }
        case EMPTY_TRASH:
            if (state && action.payload.trashedPhotoIds.indexOf(state.currentPhoto.photoId) !== -1) {
                return null
            } else {
                return state
            }
        case OPEN_DIFF:
            return {
                ...state,
                showDiff: true
            }
        case CLOSE_DIFF:
            return {
                ...state,
                showDiff: false
            }
        default:
            return state
    }
}
