import { Action } from '../ActionType'
import { SETTINGS_EXISTS_SUCCESS, SETTINGS_EXISTS_FAILURE, FETCH_SECTIONS_SUCCESS, OPEN_TAGS_EDITOR, CLOSE_TAGS_EDITOR } from '../actionTypes'


export type ModalState = 'splash' | 'settings' | 'tags' | null

export type NavigationState = {
    settingsExist: boolean
    modal: ModalState
}

const initialNavigationState: NavigationState = {
    settingsExist: false,
    modal: 'splash'
}

export const navigation = (state: NavigationState = initialNavigationState, action: Action): NavigationState => {
    switch (action.type) {
        case SETTINGS_EXISTS_SUCCESS:
            return {
                ...state,
                settingsExist: true
            }
        case SETTINGS_EXISTS_FAILURE:
            return {
                settingsExist: false,
                modal: 'settings'
            }
        case FETCH_SECTIONS_SUCCESS:
            if (state.modal == 'splash') {
                return {
                    ...state,
                    modal: null
                }
            } else {
                return state
            }
        case OPEN_TAGS_EDITOR:
            return {
                ...state,
                modal: 'tags'
            }
        case CLOSE_TAGS_EDITOR:
            return {
                ...state,
                modal: null
            }
        default:
            return state
    }
}
