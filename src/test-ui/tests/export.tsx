import React from 'react'

import { Export, Props } from 'app/ui/Export'

import {addSection, action} from 'test-ui/core/UiTester'
import { testBigPhoto } from 'test-ui/util/MockData'


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
