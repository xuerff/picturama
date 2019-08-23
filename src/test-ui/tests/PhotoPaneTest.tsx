import React from 'react'

import { ExifOrientation } from 'common/CommonTypes'

import PhotoPane, { Props } from 'app/ui/detail/PhotoPane'

import { addSection, action, TestContext } from 'test-ui/core/UiTester'


function createDefaultProps(context: TestContext): Props {
    return {
        style:  { backgroundColor: 'red' },
        width:  800,
        height: 600,
        src: '../src/test-photos/IMG_9700.JPG',
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
