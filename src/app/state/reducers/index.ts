import { Action } from 'app/state/ActionType'

import { AppState } from 'app/state/StateTypes'

import { navigation } from './navigation'
import { data } from './data'
import { library } from './library'
import { detail } from './detail'
import { importReducer } from './import'
import { exportReducer } from './export'


export default (state: AppState = {} as AppState, action: Action) => {
    const dataState = data(state.data, action)
    const detailState = detail(state.detail, dataState, action)
    return {
        navigation: navigation(state.navigation, detailState, action),
        data: dataState,
        library: library(state.library, action),
        detail: detailState,
        import: importReducer(state.import, action),
        export: exportReducer(state.export, action),
    }
}
