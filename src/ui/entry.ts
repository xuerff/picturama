import React from 'react'
import { render } from 'react-dom'

import { setLocale } from 'common/i18n/i18n'

import BackgroundClient from 'ui/BackgroundClient'
import { init as initForegroundService } from 'ui/ForegroundService'
import App from 'ui/components/App'
import { checkSettingsExist } from 'ui/controller/SettingsController'

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

BackgroundClient.fetchUiConfig()
    .then(uiConfig => {
        setLocale(uiConfig.locale)

        initForegroundService()
        checkSettingsExist()
        
        render(React.createElement(App), document.getElementById('app'))
    })
    .catch(error => {
        // TODO: Show error in UI
        console.error('Initializing UI failed', error)
    })
