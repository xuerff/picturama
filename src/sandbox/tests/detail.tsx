import * as React from 'react'

import {addSection, action} from '../core/UiTester'

import { PictureDetail } from '../../ui/components/detail/PictureDetail'
import { PhotoType } from '../../common/models/Photo'


const testPhoto: PhotoType = {
    id: 'B1m80éAMpf',
    title: 'IMG_9700',
    master: '../specs/photos/IMG_9700.JPG',
    thumb: '../specs/photos/IMG_9700.JPG',
    thumb_250: '../specs/photos/IMG_9700.JPG', // '../dot-ansel/thumbs-250/IMG_9700.webp',
    extension: 'JPG',
    flag: 0,
    created_at: 1474222345000,
    updated_at: null,
    orientation: 1,
    exposure_time: 0.016666666666666666,
    iso: 1600,
    focal_length: 55,
    aperture: 5.6,
    date: '2016-09-18',
    trashed: 0,
    versions: [],
    tags: [],
    versionNumber: 1
}


const defaultProps = {
    style: { width: '100%', height: '100%' },
    isActive: true,
    photo: testPhoto,
    isFirst: true,
    isLast: false,

    setPreviousDetailPhoto: action('setPreviousDetailPhoto'),
    setNextDetailPhoto: action('setNextDetailPhoto'),
    updatePhotoWork: action('updatePhotoWork'),
    toggleFlag: action('toggleFlag'),
    movePhotosToTrash: action('movePhotosToTrash'),
    openExport: action('openExport'),
    openTagsEditor: action('openTagsEditor'),
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
