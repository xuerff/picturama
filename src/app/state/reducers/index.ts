import { Action } from 'app/state/ActionType'

import { AppState } from 'app/state/StateTypes'

import { navigation } from './navigation'
import { data } from './data'
import { library } from './library'
import { detail } from './detail'
import { importReducer } from './import'
import { exportReducer } from './export'


export default (state: AppState = {} as AppState, action: Action) => {
    const detailState = detail(state.detail, action)
    return {
        navigation: navigation(state.navigation, detailState, action),
        data: data(state.data, action),
        library: library(state.library, action),
        detail: detailState,
        import: importReducer(state.import, action),
        export: exportReducer(state.export, action),
    }
}
