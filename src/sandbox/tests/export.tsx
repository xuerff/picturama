import React from 'react'

import { Export, Props } from 'ui/components/Export'

import {addSection, action} from 'sandbox/core/UiTester'
import { testBigPhoto } from 'sandbox/util/MockData'


const defaultProps: Props = {
    style: { width: '100%', height: '100%' },

    photoIds: [ testBigPhoto.id ],
    photoData: { [testBigPhoto.id]: testBigPhoto },

    closeExport: action('closeExport'),
}


addSection('Export')
    .setArenaStyle({ zIndex: -1 })
    .add('normal', context => (
        <Export
            {...defaultProps}
        />
    ))
