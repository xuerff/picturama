import { Action } from '../ActionType'
import { SETTINGS_EXISTS_SUCCESS, SETTINGS_EXISTS_FAILURE, OPEN_TAGS_EDITOR, CLOSE_TAGS_EDITOR } from '../actionTypes'


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
                settingsExist: true,
                modal: (state.modal == 'splash') ? null : state.modal
            }
        case SETTINGS_EXISTS_FAILURE:
            return {
                settingsExist: false,
                modal: 'settings'
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
