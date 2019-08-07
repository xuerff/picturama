import React from 'react'

import {addSection, action, TestContext} from '../core/UiTester'

import PhotoPane, { Props } from '../../ui/components/detail/PhotoPane'
import { ExifOrientation } from '../../common/models/DataTypes'

function createDefaultProps(context: TestContext): Props {
    return {
        style:  { backgroundColor: 'red' },
        width:  800,
        height: 600,
        src: '../specs/photos/IMG_9700.JPG',
        srcPrev: null,
        srcNext: null,
        orientation: ExifOrientation.Up,
        photoWork: {},
        zoom: context.state.zoom || 1,
        setLoading: action('setLoading'),
        onZoomChange(zoom: number) {
            context.state.zoom = zoom
            context.forceUpdate()
        },
    }
}

addSection('PhotoPane')
    .add('normal', context => (
        <PhotoPane
            {...createDefaultProps(context)}
        />
    ))
    .add('rotate left', context => (
        <PhotoPane
            {...createDefaultProps(context)}
            orientation={ExifOrientation.Left}
        />
    ))
    .add('rotate right', context => (
        <PhotoPane
            {...createDefaultProps(context)}
            orientation={ExifOrientation.Right}
        />
    ))
    .add('rotate bottom', context => (
        <PhotoPane
            {...createDefaultProps(context)}
            orientation={ExifOrientation.Bottom}
        />
    ))
