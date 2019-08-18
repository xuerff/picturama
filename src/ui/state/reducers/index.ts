import { Action } from 'ui/state/ActionType'

import { NavigationState, navigation } from './navigation'
import { DataState, data } from './data'
import { LibraryState, library } from './library'
import { DetailState, detail } from './detail'
import { ImportState, importReducer } from './import'
import { ExportState, exportReducer } from './export'


export type AppState = {
    readonly navigation: NavigationState
    readonly data: DataState
    readonly library: LibraryState
    readonly detail: DetailState
    readonly import: ImportState
    readonly export: ExportState
}

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
