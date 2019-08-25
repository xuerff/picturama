import { Tag } from 'common/CommonTypes'
import { ImportProgress } from 'common/CommonTypes'

import { fetchSections, fetchTotalPhotoCount } from 'app/controller/PhotoController'
import { setTags } from 'app/controller/PhotoTagController'
import { setImportProgressAction } from 'app/state/actions'
import store from 'app/state/store'

import { observeStore } from 'app/util/ReduxUtil'


/** The interval in which to update the library grid while running an import (in ms) */
const importUiUpdateInterval = 10000

let prevImportUiUpdateTime = 0
let postponedUpdateLibraryUnsubscribe: (() => void) | null = null


export default class ImportProgressController {

    private constructor() {}

    static setImportProgress(progress: ImportProgress | null, updatedTags: Tag[] | null) {
        store.dispatch(setImportProgressAction(progress))

        const isImportFinished = !progress
        const now = Date.now()
        if (isImportFinished || now > prevImportUiUpdateTime + importUiUpdateInterval) {
            prevImportUiUpdateTime = now
            updateLibrary()
        }

        if (updatedTags) {
            setTags(updatedTags)
        }
    }

}

function updateLibrary() {
    const state = store.getState()
    if (state.navigation.mainView === null) {
        fetchTotalPhotoCount()
        fetchSections()
    } else {
        // Workaround: If the detail view is active, the detail view would be closed by `fetchSections` since the
        //             section shown in detail view will get unloaded
        //             -> We postpone `fetchSections` until the detail view is closed
        if (!postponedUpdateLibraryUnsubscribe) {
            postponedUpdateLibraryUnsubscribe = observeStore(store,
                state => state.navigation.mainView,
                mainView => {
                    if (mainView === null) {
                        postponedUpdateLibraryUnsubscribe!()
                        postponedUpdateLibraryUnsubscribe = null
                        updateLibrary()
                    }
                })
        }
    }
}
