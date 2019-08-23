import React from 'react'
import { render } from 'react-dom'

import { setLocale } from 'common/i18n/i18n'

import UiTester from 'test-ui/core/UiTester'
import 'test-ui/tests/library'
import 'test-ui/tests/detail'
import 'test-ui/tests/SettingsPaneTest'
import 'test-ui/tests/info'
import 'test-ui/tests/ImportProgressButtonTest'
import 'test-ui/tests/export'
import 'test-ui/tests/GridSectionTest'
import 'test-ui/tests/PhotoPaneTest'
import 'test-ui/tests/icon'

import 'app/entry.less'
import 'test-ui/entry.less'


window['UiTester'] = {
    start(elem: HTMLElement) {
        setLocale('en')
        render(
            <UiTester/>,
            elem)
    }
}
