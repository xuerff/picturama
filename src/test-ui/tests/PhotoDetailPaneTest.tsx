import React from 'react'

import { PhotoDetailPane, Props } from 'app/ui/detail/PhotoDetailPane'

import {addSection, action} from 'test-ui/core/UiTester'
import { testBigPhoto } from 'test-ui/util/MockData'


const defaultProps: Props = {
    style: { width: '100%', height: '100%', overflow: 'hidden' },
    isActive: true,
    sectionId: 'dummy',
    photo: testBigPhoto,
    photoPrev: null,
    photoNext: null,
    photoWork: {},
    photoDetail: { versions: [], tags: [] },
    tags: [],
    isFirst: true,
    isLast: false,
    toggleMaximized: action('toggleMaximized'),
    setPreviousDetailPhoto: action('setPreviousDetailPhoto'),
    setNextDetailPhoto: action('setNextDetailPhoto'),
    getFileSize(path: string): Promise<number> { return Promise.resolve(3380326) },
    updatePhotoWork: action('updatePhotoWork'),
    setPhotosFlagged: action('setPhotosFlagged'),
    setPhotoTags: action('setPhotoTags'),
    movePhotosToTrash: action('movePhotosToTrash'),
    restorePhotosFromTrash: action('restorePhotosFromTrash'),
    openExport: action('openExport'),
    openDiff: action('openDiff'),
    closeDetail: action('closeDetail'),
}


addSection('PhotoDetailPane')
    .add('loading', context => (
        <PhotoDetailPane
            {...defaultProps}
            photoWork={null}
            photoDetail={null}
        />
    ))
    .add('done', context => (
        <PhotoDetailPane
            {...defaultProps}
        />
    ))
