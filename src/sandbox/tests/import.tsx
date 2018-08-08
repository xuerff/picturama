import * as React from 'react'

import {addSection, action} from '../core/UiTester'

import Progress from '../../ui/components/Progress'


const containerProps = {
    style: { width: '100%', height: '100%' },
    className: 'Test-Ansel-container'
}


addSection('Import')
    .add('start', context => (
        <div {...containerProps}>
            <Progress
                progress={{ processed: 0, total: 0, photosDir: null }}
            />
        </div>
    ))
    .add('progress', context => (
        <div {...containerProps}>
            <Progress
                progress={{ processed: 120, total: 1042, photosDir: 'mypics/2018/summer vacation' }}
            />
        </div>
    ))
