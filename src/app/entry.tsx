import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'

import { setLocale } from 'common/i18n/i18n'

import BackgroundClient from 'app/BackgroundClient'
import { init as initForegroundService } from 'app/ForegroundService'
import App from 'app/ui/main/App'
import { initAction } from 'app/state/actions'
import store from 'app/state/store'

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
                <App/>
            </Provider>,
            document.getElementById('app'))
    })
    .catch(error => {
        // TODO: Show error in UI
        console.error('Initializing UI failed', error)
    })
