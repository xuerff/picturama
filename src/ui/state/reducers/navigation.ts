import { Action } from 'ui/state/ActionType'
import { OPEN_SETTINGS, CLOSE_SETTINGS, OPEN_DIFF, CLOSE_DIFF } from 'ui/state/actionTypes'

import { DetailState } from './detail'


export type MainViewState = 'settings' | 'detail' | 'diff' | null

export type NavigationState = {
    mainView: MainViewState
}

const initialNavigationState: NavigationState = {
    mainView: null
}

export const navigation = (state: NavigationState = initialNavigationState, detailState: DetailState | null, action: Action): NavigationState => {
    switch (action.type) {
        case OPEN_SETTINGS:
            return {
                mainView: 'settings'
            }
        case OPEN_DIFF:
            return {
                mainView: 'diff'
            }
        case CLOSE_SETTINGS:
        case CLOSE_DIFF:
            return {
                mainView: null
            }
        default:
            if (state.mainView === null && detailState) {
                return {
                    mainView: 'detail'
                }
            } else if (state.mainView === 'detail' && !detailState) {
                return {
                    mainView: null
                }
            } else {
                return state
            }
    }
}
