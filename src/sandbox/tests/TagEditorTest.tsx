import * as React from 'react'

import {addSection, action} from '../core/UiTester'

import { TagEditor } from '../../ui/components/TagEditor'
import { testPhoto } from '../util/MockData'


const defaultProps = {
    style: { width: '100%', height: '100%' },

    photo: testPhoto,

    createTagsAndAssociateToPhoto: action('createTagsAndAssociateToPhoto'),
    closeTagsEditor: action('closeTagsEditor'),
}


addSection('TagEditor')
    .add('normal', context => (
        <TagEditor
            {...defaultProps}
        />
    ))
