import * as React from 'react'

import {addSection, action} from '../core/UiTester'

import PhotoPane from '../../components/detail/PhotoPane'
import { ExifOrientation } from '../../models/DataTypes'

const defaultProps = {
    style:  { backgroundColor: '#888' },
    width:  800,
    height: 600,
    onLoad: action('onLoad')
}

addSection('PhotoPane')
    .add('normal', context => (
        <PhotoPane
            {...defaultProps}
            src="../specs/photos/IMG_9700.JPG"
            orientation={ExifOrientation.Up}
        />
    ))
    .add('rotate left', context => (
        <PhotoPane
            {...defaultProps}
            src="../specs/photos/IMG_9700.JPG"
            orientation={ExifOrientation.Left}
        />
    ))
    .add('rotate right', context => (
        <PhotoPane
            {...defaultProps}
            src="../specs/photos/IMG_9700.JPG"
            orientation={ExifOrientation.Right}
        />
    ))
    .add('rotate bottom', context => (
        <PhotoPane
            {...defaultProps}
            src="../specs/photos/IMG_9700.JPG"
            orientation={ExifOrientation.Bottom}
        />
    ))
