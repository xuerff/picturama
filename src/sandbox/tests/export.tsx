import * as React from 'react'

import {addSection, action} from '../core/UiTester'

import { Export } from '../../ui/components/Export'
import { testPhoto } from '../util/MockData'


const defaultProps = {
    style: { width: '100%', height: '100%' },

    photoIds: [ testPhoto.id ],
    photos: { [testPhoto.id]: testPhoto },

    closeExport: action('closeExport'),
}


addSection('Export')
    .add('normal', context => (
        <Export
            {...defaultProps}
        />
    ))
