import * as React from 'react'

import {addSection, action} from '../core/UiTester'

import PhotoPane from '../../ui/components/detail/PhotoPane'
import { ExifOrientation } from '../../common/models/DataTypes'

const defaultProps = {
    style:  { backgroundColor: '#888' },
    width:  800,
    height: 600,
    src: '../specs/photos/IMG_9700.JPG',
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
