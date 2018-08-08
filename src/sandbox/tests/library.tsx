import * as React from 'react'

import {addSection, action} from '../core/UiTester'

import { PhotoType } from '../../common/models/Photo';
import CancelablePromise from '../../common/util/CancelablePromise';
import { Library } from '../../ui/components/library/Library'

import { getNonRawImgPath } from '../../ui/data/ImageProvider'
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
    getThumbnailPath: (photo: PhotoType) => {
        const thumbnailPath = getNonRawImgPath(photo)
        if (thumbnailPath) {
            return new CancelablePromise<string>(Promise.resolve(thumbnailPath))
        } else {
            return new CancelablePromise<string>(() => {})
        }
    },
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
    .add('creating thumbnails', context => {
        let photos = { ...defaultProps.photos }
        let photoIds = [ ...defaultProps.photoIds ]
        for (let i = 0; i < 100; i++) {
            const photo: PhotoType = {
                ...testPhoto,
                id: `dummy-${i}`,
                title: `dummy-${i}.JPG`,
                master: null,
                thumb: null
            }
            photos[photo.id] = photo
            photoIds.push(photo.id)
        }

        return (
            <Library
                {...defaultProps}
                photos={photos}
                photoIds={photoIds}
            />
        )
    })
    .add('empty', context => (
        <Library
            {...defaultProps}
            photoIds={[]}
            photosCount={0}
        />
    ))
