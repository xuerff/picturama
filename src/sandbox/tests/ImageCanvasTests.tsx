import * as React from 'react'

import {addSection, action} from '../core/UiTester'

import ImageCanvas from '../../components/detail/ImageCanvas'
import { ExifOrientation } from '../../models/DataTypes'

const defaultProps = {
    style:  { backgroundColor: '#888' },
    width:  800,
    height: 600,
    onLoad: action('onLoad')
}

addSection('ImageCanvas')
    .add('normal', context => (
        <ImageCanvas
            {...defaultProps}
            src="../specs/photos/IMG_9700.JPG"
            orientation={ExifOrientation.Up}
        />
    ))
    .add('rotate left', context => (
        <ImageCanvas
            {...defaultProps}
            src="../specs/photos/IMG_9700.JPG"
            orientation={ExifOrientation.Left}
        />
    ))
    .add('rotate right', context => (
        <ImageCanvas
            {...defaultProps}
            src="../specs/photos/IMG_9700.JPG"
            orientation={ExifOrientation.Right}
        />
    ))
    .add('rotate bottom', context => (
        <ImageCanvas
            {...defaultProps}
            src="../specs/photos/IMG_9700.JPG"
            orientation={ExifOrientation.Bottom}
        />
    ))
