import React from 'react'

import {addSection, action} from 'sandbox/core/UiTester'

import { SettingsPane, Props } from 'ui/components/SettingsPane'


const defaultProps: Props = {
    style: { width: '100%', height: '100%' },
    initialSettings: {
        photoDirs: [ '/Users/me/Documents/Photos', '/Users/me/ownCloud/Photos' ],
    },
    selectDirectories: () => Promise.resolve([ '/Users/me/Dropbox/Photos' ]),
    onClose: action('onClose'),
}


addSection('Settings')
    .add('first start', context => (
        <SettingsPane
            {...defaultProps}
            initialSettings={{ photoDirs: [] }}
        />
    ))
    .add('normal', context => (
        <SettingsPane
            {...defaultProps}
        />
    ))
