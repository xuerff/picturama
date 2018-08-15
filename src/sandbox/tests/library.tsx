import React from 'react'

import {addSection, action} from '../core/UiTester'

import { PhotoType } from '../../common/models/Photo';
import CancelablePromise from '../../common/util/CancelablePromise';
import { Library } from '../../ui/components/library/Library'

import { getNonRawImgPath } from '../../ui/controller/ImageProvider'
import { testPhoto } from '../util/MockData'


const defaultProps = {
    style: { width: '100%', height: '100%' },
    isActive: true,

    isFetching: false,
    photos: { [testPhoto.id]: testPhoto },
    photoIds: [ testPhoto.id ],
    photosCount: 1042,
    totalPhotosCount: 12345,
    highlightedPhotoIds: [],
    showOnlyFlagged: false,
    isShowingTrash: false,

    fetchTotalPhotoCount: action('fetchTotalPhotoCount'),
    fetchPhotos: action('fetchPhotos'),
    getThumbnailSrc: (photo: PhotoType) => getNonRawImgPath(photo),
    createThumbnail: (photo: PhotoType) => {
        const thumbnailPath = getNonRawImgPath(photo)
        if (thumbnailPath === 'dummy') {
            return new CancelablePromise<string>(() => {})
        } else {
            return new CancelablePromise<string>(Promise.resolve(thumbnailPath))
        }
    },
    setHighlightedPhotos: action('setHighlightedPhotos'),
    setDetailPhotoById: action('setDetailPhotoById'),
    openExport: action('openExport'),
    setPhotosFlagged: action('setPhotosFlagged'),
    updatePhotoWork: action('updatePhotoWork'),
    toggleShowOnlyFlagged: action('toggleShowOnlyFlagged'),
    startScanning: action('startScanning'),
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
                master: 'dummy',
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
    .add('Fetching photos', context => (
        <Library
            {...defaultProps}
            isFetching={true}
        />
    ))
    .add('Selection empty', context => (
        <Library
            {...defaultProps}
            photoIds={[]}
            photosCount={0}
        />
    ))
    .add('No photos', context => (
        <Library
            {...defaultProps}
            photoIds={[]}
            photosCount={0}
            totalPhotosCount={0}
        />
    ))
