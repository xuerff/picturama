import React from 'react'
import { render } from 'react-dom'

import { setLocale } from 'ui/i18n/i18n'

import UiTester from './core/UiTester'
import './tests/library'
import './tests/sidebar'
import './tests/detail'
import './tests/settings'
import './tests/info'
import './tests/import'
import './tests/export'
import './tests/GridSectionTest'
import './tests/PhotoPaneTest'

import 'ui/entry.less'
import './entry.less'


window['Sandbox'] = {
    start(elem: HTMLElement) {
        setLocale('en')
        render(
            <UiTester/>,
            elem)
    }
}
