import * as React from 'react'
import { render } from 'react-dom'

import UiTester from './core/UiTester'
import './tests/library'
import './tests/sidebar'
import './tests/detail'
import './tests/settings'
import './tests/import'
import './tests/export'
import './tests/PhotoPaneTests'

export function start(elem) {
  render(
    <UiTester/>,
    elem)
}
