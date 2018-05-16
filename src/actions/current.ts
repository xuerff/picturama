import { fetchPhotoWork } from '../BackgroundClient'
import store from '../store'
import AppState from '../reducers/AppState'
import CancelablePromise, { isCancelError } from '../util/CancelablePromise'
import { PhotoWork } from '../models/photo'


let runningFetch: CancelablePromise<void> | null = null

export const setCurrent = current => dispatch => {
    dispatch({ type: 'SET_CURRENT_SUCCESS', current })
    if (current !== -1) {
        if (runningFetch) {
            runningFetch.cancel()
        }

        const state = store.getState() as AppState
        const photoPath = state.photos[current].master
        runningFetch = new CancelablePromise<PhotoWork>(fetchPhotoWork(photoPath))
            .then(photoWork => {
                dispatch({ type: 'FETCH_PHOTO_WORK_SUCCESS', photoWork })
            })
            .catch(error => {
                if (!isCancelError(error)) {
                    // TODO: Show error to the user
                    console.error('Fetching photo work failed: ' + photoPath, error)
                }
            })
            .then(() => runningFetch = null)
    }
}
