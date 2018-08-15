import React from 'react'

import {addSection, action} from '../core/UiTester'

import { PhotoType, PhotoSectionById, PhotoSectionId } from '../../common/models/Photo';
import CancelablePromise from '../../common/util/CancelablePromise';
import { Library } from '../../ui/components/library/Library'

import { getNonRawImgPath } from '../../ui/controller/ImageProvider'
import { testPhoto } from '../util/MockData'


const defaultSectionId: PhotoSectionId = '2018-08-15'
const defaultPhotoIds = [ testPhoto.id ]
const defaultPhotoData = { [testPhoto.id]: testPhoto }

const defaultProps = {
    style: { width: '100%', height: '100%' },
    isActive: true,

    isFetching: false,

    photoCount: 1042,
    totalPhotoCount: 12345,
    sectionIds: [ defaultSectionId ],
    sectionById: {
        [defaultSectionId]: {
            id: defaultSectionId,
            title: defaultSectionId,
            count: defaultPhotoIds.length,
            photoIds: defaultPhotoIds,
            photoData: defaultPhotoData
        }
    } as PhotoSectionById,
    selectedSectionId: null,
    selectedPhotoIds: [],
    showOnlyFlagged: false,
    isShowingTrash: false,

    fetchTotalPhotoCount: action('fetchTotalPhotoCount'),
    fetchSections: action('fetchSections'),
    getThumbnailSrc: (photo: PhotoType) => getNonRawImgPath(photo),
    createThumbnail: (photo: PhotoType) => {
        const thumbnailPath = getNonRawImgPath(photo)
        if (thumbnailPath === 'dummy') {
            return new CancelablePromise<string>(() => {})
        } else {
            return new CancelablePromise<string>(Promise.resolve(thumbnailPath))
        }
    },
    setSelectedPhotos: action('setSelectedPhotos'),
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
    .add('selection', context => (
        <Library
            {...defaultProps}
            selectedPhotoIds={[ testPhoto.id ]}
        />
    ))
    .add('creating thumbnails', context => {
        let photoIds = [ ...defaultPhotoIds ]
        let photoData = { ...defaultPhotoData }
        for (let i = 0; i < 100; i++) {
            const photo: PhotoType = {
                ...testPhoto,
                id: `dummy-${i}`,
                title: `dummy-${i}.JPG`,
                master: 'dummy',
                non_raw: null
            }
            photoData[photo.id] = photo
            photoIds.push(photo.id)
        }

        return (
            <Library
                {...defaultProps}
                sectionIds={[ defaultSectionId ]}
                sectionById={{
                    [defaultSectionId]: {
                        id: defaultSectionId,
                        title: defaultSectionId,
                        count: photoIds.length,
                        photoIds,
                        photoData
                    }
                } as PhotoSectionById}
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
            photoCount={0}
            sectionIds={[]}
            sectionById={{}}
        />
    ))
    .add('No photos', context => (
        <Library
            {...defaultProps}
            photoCount={0}
            totalPhotoCount={0}
            sectionIds={[]}
            sectionById={{}}
        />
    ))
