import { Action } from 'app/state/ActionType'
import { SET_FULL_SCREEN, OPEN_SETTINGS, CLOSE_SETTINGS, OPEN_DIFF, CLOSE_DIFF } from 'app/state/actionTypes'

import { DetailState } from './detail'


export type MainViewState = 'settings' | 'detail' | 'diff' | null

export type NavigationState = {
    isFullScreen: boolean
    mainView: MainViewState
}

const initialNavigationState: NavigationState = {
    isFullScreen: false,
    mainView: null
}

export const navigation = (state: NavigationState = initialNavigationState, detailState: DetailState | null, action: Action): NavigationState => {
    switch (action.type) {
        case SET_FULL_SCREEN:
            return {
                ...state,
                isFullScreen: action.payload
            }
        case OPEN_SETTINGS:
            return {
                ...state,
                mainView: 'settings'
            }
        case OPEN_DIFF:
            return {
                ...state,
                mainView: 'diff'
            }
        case CLOSE_SETTINGS:
        case CLOSE_DIFF:
            return {
                ...state,
                mainView: null
            }
        default:
            if (state.mainView === null && detailState) {
                return {
                    ...state,
                    mainView: 'detail'
                }
            } else if (state.mainView === 'detail' && !detailState) {
                return {
                    ...state,
                    mainView: null
                }
            } else {
                return state
            }
    }
}
