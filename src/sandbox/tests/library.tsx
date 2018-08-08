import * as React from 'react'

import {addSection, action} from '../core/UiTester'

import { Library } from '../../ui/components/library/Library'
import { testPhoto } from '../util/MockData'


const defaultProps = {
    style: { width: '100%', height: '100%' },
    isActive: true,

    photos: { [testPhoto.id]: testPhoto },
    photoIds: [ testPhoto.id ],
    photosCount: 1042,
    highlightedPhotoIds: [],
    showOnlyFlagged: false,
    isShowingTrash: false,

    fetchPhotos: action('fetchPhotos'),
    setHighlightedPhotos: action('setHighlightedPhotos'),
    setDetailPhotoById: action('setDetailPhotoById'),
    openExport: action('openExport'),
    setPhotosFlagged: action('setPhotosFlagged'),
    updatePhotoWork: action('updatePhotoWork'),
    toggleShowOnlyFlagged: action('toggleShowOnlyFlagged'),
}


addSection('Library')
    .add('normal', context => (
        <Library
            {...defaultProps}
        />
    ))
    .add('highlight', context => (
        <Library
            {...defaultProps}
            highlightedPhotoIds={[ testPhoto.id ]}
        />
    ))
    .add('empty', context => (
        <Library
            {...defaultProps}
            photoIds={[]}
            photosCount={0}
        />
    ))
