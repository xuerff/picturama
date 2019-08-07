import React from 'react'

import {addSection, action} from '../core/UiTester'

import PhotoPane, { Props } from '../../ui/components/detail/PhotoPane'
import { ExifOrientation } from '../../common/models/DataTypes'

const defaultProps: Props = {
    style:  { backgroundColor: 'red' },
    width:  800,
    height: 600,
    src: '../specs/photos/IMG_9700.JPG',
    srcPrev: null,
    srcNext: null,
    orientation: ExifOrientation.Up,
    photoWork: {},
    setLoading: action('setLoading')
}

addSection('PhotoPane')
    .add('normal', context => (
        <PhotoPane
            {...defaultProps}
        />
    ))
    .add('rotate left', context => (
        <PhotoPane
            {...defaultProps}
            orientation={ExifOrientation.Left}
        />
    ))
    .add('rotate right', context => (
        <PhotoPane
            {...defaultProps}
            orientation={ExifOrientation.Right}
        />
    ))
    .add('rotate bottom', context => (
        <PhotoPane
            {...defaultProps}
            orientation={ExifOrientation.Bottom}
        />
    ))
