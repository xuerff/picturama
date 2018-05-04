import * as React from 'react'
import { render } from 'react-dom'

import UiTester from './core/UiTester'
import './tests/detail'
import './tests/ImageCanvasTests'

export function start(elem) {
  render(
    <UiTester/>,
    elem)
}
