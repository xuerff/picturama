import React from 'react'

import {addSection, action} from '../core/UiTester'

import { PhotoDetail } from '../../common/models/Photo'
import { TagEditor } from '../../ui/components/TagEditor'
import { testPhoto } from '../util/MockData'


const defaultProps = {
    style: { width: '100%', height: '100%' },

    photo: testPhoto,
    photoDetail: {
        tags: [
            { id: 13, title: 'Vacation', slug: 'vacation', created_at: Date.now(), updated_at: null },
            { id: 25, title: 'nice', slug: 'nice', created_at: Date.now(), updated_at: null }
        ],
        versions: []
    } as PhotoDetail,

    createTagsAndAssociateToPhoto: action('createTagsAndAssociateToPhoto'),
    closeTagsEditor: action('closeTagsEditor'),
}


addSection('TagEditor')
    .add('normal', context => (
        <TagEditor
            {...defaultProps}
        />
    ))
