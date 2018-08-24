import React from 'react'

import {addSection, action} from '../core/UiTester'

import PhotoInfo from '../../ui/components/info/PhotoInfo'

import { testPhoto } from '../util/MockData'


const baseUrl = 'dist'

const defaultProps = {
    style: { width: '300px', height: '100%' },

    isActive: true,
    photo: { ...testPhoto, master: `${baseUrl}/${testPhoto.master}` },

    closeInfo: action('closeInfo'),
}


addSection('PhotoInfo')
    .add('normal', context => (
        <PhotoInfo
            {...defaultProps}
        />
    ))
    .add('no photo', context => (
        <PhotoInfo
            {...defaultProps}
            photo={null}
        />
    ))
    .add('not active', context => (
        <PhotoInfo
            {...defaultProps}
            isActive={false}
        />
    ))
