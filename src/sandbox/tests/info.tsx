import React from 'react'

import { PhotoType, PhotoDetail } from 'common/models/Photo'

import PhotoInfo from 'ui/components/info/PhotoInfo'

import { addSection, action, TestContext } from 'sandbox/core/UiTester'
import { testBigPhoto } from 'sandbox/util/MockData'


const baseUrl = 'dist'
const defaultTags = [ 'Holiday', 'Family', 'Cool stuff' ]

const defaultProps = {
    style: { width: '300px', height: '100%' },

    isActive: true,
    photo: { ...testBigPhoto, master: `${baseUrl}/${testBigPhoto.master}` },
    tags: defaultTags,
    closeInfo: action('closeInfo')
}

let sharedPhotoDetail: PhotoDetail = {
    versions: [],
    tags: [ defaultTags[0], defaultTags[2] ]
}

function createGridRowHeightProps(context: TestContext) {
    return {
        photoDetail: sharedPhotoDetail,
        setPhotoTags: (photo: PhotoType, tags: string[]) => {
            sharedPhotoDetail = {
                versions: sharedPhotoDetail.versions,
                tags
            }
            context.forceUpdate()
        }
    }
}


addSection('PhotoInfo')
    .add('normal', context => (
        <PhotoInfo
            {...defaultProps}
            {...createGridRowHeightProps(context)}
        />
    ))
    .add('filename overflow', context => (
        <PhotoInfo
            {...defaultProps}
            {...createGridRowHeightProps(context)}
            photo={{ ...testBigPhoto, master: `${baseUrl}/../specs/photos/RAW_FUJI_FINEPIX_X100.RAF` }}
        />
    ))
    .add('no tags', context => (
        <PhotoInfo
            {...defaultProps}
            {...createGridRowHeightProps(context)}
            photoDetail={{ versions: [], tags: [] }}
        />
    ))
    .add('loading tags', context => (
        <PhotoInfo
            {...defaultProps}
            {...createGridRowHeightProps(context)}
            photoDetail={null}
        />
    ))
    .add('no photo', context => (
        <PhotoInfo
            {...defaultProps}
            {...createGridRowHeightProps(context)}
            photo={null}
        />
    ))
    .add('not active', context => (
        <PhotoInfo
            {...defaultProps}
            {...createGridRowHeightProps(context)}
            isActive={false}
        />
    ))
