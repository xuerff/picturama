import * as React from 'react'

import {addSection, action} from '../core/UiTester'

import ImageCanvas from '../../components/detail/ImageCanvas'

addSection('ImageCanvas')
    .add('simple', context => (
        <ImageCanvas
            style={{ backgroundColor: '#888' }}
            width={400}
            height={400}
            src="../specs/photos/IMG_9700.JPG"
            orientation={1}
        />
    ))
