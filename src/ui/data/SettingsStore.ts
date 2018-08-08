import * as fs from 'fs'

import config from '../../common/config'
import { checkSettingsExistAction } from '../state/actions'
import store from '../state/store'
import { assertRendererProcess } from '../../common/util/ElectronUtil'


assertRendererProcess()

export function checkSettingsExist() {
    store.dispatch(checkSettingsExistAction.request())
    fs.access(config.settings, fs.constants.R_OK | fs.constants.W_OK, err => {
        if (err) {
            store.dispatch(checkSettingsExistAction.failure(err))
        } else {
            store.dispatch(checkSettingsExistAction.success())
        }
    })
}
