import React from 'react'
import { render } from 'react-dom'

import { setLocale } from 'common/i18n/i18n'

import UiTester from 'sandbox/core/UiTester'
import 'sandbox/tests/library'
import 'sandbox/tests/detail'
import 'sandbox/tests/SettingsPaneTest'
import 'sandbox/tests/info'
import 'sandbox/tests/ImportProgressButtonTest'
import 'sandbox/tests/export'
import 'sandbox/tests/GridSectionTest'
import 'sandbox/tests/PhotoPaneTest'

import 'app/entry.less'
import 'sandbox/entry.less'


window['Sandbox'] = {
    start(elem: HTMLElement) {
        setLocale('en')
        render(
            <UiTester/>,
            elem)
    }
}
