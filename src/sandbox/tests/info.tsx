import React from 'react'

import {addSection, action, TestContext} from '../core/UiTester'

import { PhotoSectionId, PhotoDetail, PhotoId } from '../../common/models/Photo'
import { TagType, TagById, TagId } from '../../common/models/Tag'
import { slug } from '../../common/util/LangUtil'

import PhotoInfo from '../../ui/components/info/PhotoInfo'
import { testPhoto } from '../util/MockData'


const defaultSectionId: PhotoSectionId = '2018-08-15'
const baseUrl = 'dist'
const defaultTags = [ 'Holiday', 'Family', 'Cool stuff' ]

const defaultProps = {
    style: { width: '300px', height: '100%' },

    isActive: true,
    photo: { ...testPhoto, master: `${baseUrl}/${testPhoto.master}` },
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
        setPhotoTags: (photoId: PhotoId, tags: string[]) => {
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
    .add('filename overflow', context => (
        <PhotoInfo
            {...defaultProps}
            {...createGridRowHeightProps(context)}
            photo={{ ...testPhoto, master: `${baseUrl}/../specs/photos/RAW_FUJI_FINEPIX_X100.RAF` }}
        />
    ))
