import React from 'react'
import { render } from 'react-dom'

import { setLocale } from 'common/i18n/i18n'

import UiTester from 'test-ui/core/UiTester'
import 'test-ui/tests/LibraryTest'
import 'test-ui/tests/PictureDetailTest'
import 'test-ui/tests/SettingsPaneTest'
import 'test-ui/tests/PhotoInfoTest'
import 'test-ui/tests/ImportProgressButtonTest'
import 'test-ui/tests/ExportTest'
import 'test-ui/tests/GridSectionTest'
import 'test-ui/tests/PhotoPaneTest'
import 'test-ui/tests/IconTest'

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
