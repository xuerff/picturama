import React from 'react'

import {addSection, action} from '../core/UiTester'

import { PictureDetail } from '../../ui/components/detail/PictureDetail'
import { testPhoto } from '../util/MockData'


const defaultProps = {
    style: { width: '100%', height: '100%', overflow: 'hidden' },
    isActive: true,
    sectionId: 'dummy',
    photo: testPhoto,
    tags: [],
    isFirst: true,
    isLast: false,

    setPreviousDetailPhoto: action('setPreviousDetailPhoto'),
    setNextDetailPhoto: action('setNextDetailPhoto'),
    updatePhotoWork: action('updatePhotoWork'),
    toggleFlag: action('toggleFlag'),
    setPhotoTags: action('setPhotoTags'),
    movePhotosToTrash: action('movePhotosToTrash'),
    openExport: action('openExport'),
    openDiff: action('openDiff'),
    closeDetail: action('closeDetail'),
}


addSection('Detail')
    .add('loading', context => (
        <PictureDetail
            {...defaultProps}
            photoWork={null}
        />
    ))
    .add('done', context => (
        <PictureDetail
            {...defaultProps}
            photoWork={{}}
        />
    ))
