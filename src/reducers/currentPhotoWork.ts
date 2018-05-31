import { PhotoWork } from '../models/Photo'
import AppState from './AppState'


export default function currentPhotoWork(state: AppState, action): AppState {
    switch (action.type) {
        case 'GET_PHOTOS_SUCCESS':
            return {
                ...state,
                currentPhotoWork: null
            }
        case 'SET_CURRENT_SUCCESS':
            return {
                ...state,
                currentPhotoWork: null
            }
        case 'FETCH_PHOTO_WORK_SUCCESS':
            return {
                ...state,
                currentPhotoWork: action.photoWork
            }
        case 'EDIT_PHOTOWORK_CHANGE': {
            const currentPhoto = state.photos[state.current]
            if (currentPhoto && currentPhoto.id === action.photoId) {
                return {
                    ...state,
                    currentPhotoWork: { ...action.photoWork }
                }
            }
        }
    }
    return state
}
