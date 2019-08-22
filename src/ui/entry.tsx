import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'

import { setLocale } from 'common/i18n/i18n'

import BackgroundClient from 'ui/BackgroundClient'
import { init as initForegroundService } from 'ui/ForegroundService'
import Ansel from 'ui/components/main/Ansel'
import { initAction } from 'ui/state/actions'
import store from 'ui/state/store'

import './entry.less'

import pkgs from '../../package.json'


if (process.env.ANSEL_DEV_MODE) {
    document.title = 'Ansel - DEV MODE'
} else {
    document.title = `Ansel - ${pkgs.version}`
}

if (process.env.ANSEL_TEST_MODE) {
    document.title = 'Ansel - TEST MODE'
}

BackgroundClient.init()

Promise
    .all([
        BackgroundClient.fetchUiConfig(),
        BackgroundClient.fetchSettings(),
        BackgroundClient.waitForBackgroundReady(),
    ])
    .then(([ uiConfig, settings ]) => {
        setLocale(uiConfig.locale)
        initForegroundService()
        store.dispatch(initAction(settings))

        render(
            <Provider store={store}>
                <Ansel />
            </Provider>,
            document.getElementById('app'))
    })
    .catch(error => {
        // TODO: Show error in UI
        console.error('Initializing UI failed', error)
    })
