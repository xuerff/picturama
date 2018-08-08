import * as React from 'react'

import {addSection, action} from '../core/UiTester'

import { Settings } from '../../ui/components/Settings'


const defaultProps = {
    style: { width: '100%', height: '100%' },
    className: 'Test-Ansel-container',

    checkSettingsExist: action('checkSettingsExist'),
}


addSection('Settings')
    .add('normal', context => (
        <Settings
            {...defaultProps}
        />
    ))
