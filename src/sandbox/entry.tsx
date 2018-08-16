import React from 'react'
import { render } from 'react-dom'

import UiTester from './core/UiTester'
import './tests/library'
import './tests/sidebar'
import './tests/detail'
import './tests/settings'
import './tests/import'
import './tests/export'
import './tests/GridSectionTest'
import './tests/PhotoPaneTest'
import './tests/TagEditorTest'

import "./entry.less"


export function start(elem) {
  render(
    <UiTester/>,
    elem)
}
