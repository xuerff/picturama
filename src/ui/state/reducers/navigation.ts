import { Action } from '../ActionType'
import { SETTINGS_EXISTS_SUCCESS, SETTINGS_EXISTS_FAILURE } from '../actionTypes'


export type ModalState = 'splash' | 'settings' | null

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
        default:
            return state
    }
}
