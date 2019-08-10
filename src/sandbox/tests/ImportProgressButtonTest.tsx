import React from 'react'

import {addSection} from 'sandbox/core/UiTester'

import ImportProgressButton from 'ui/components/ImportProgressButton'
import Toolbar from 'ui/components/widget/Toolbar';


addSection('ImportProgressButton')
    .setDecorator(testView =>
        <Toolbar style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
            {testView}
        </Toolbar>
    )
    .add('start', context => (
        <ImportProgressButton
            progress={{ processed: 0, total: 0, photosDir: null }}
        />
    ))
    .add('progress', context => (
        <ImportProgressButton
            progress={{ processed: 120, total: 1042, photosDir: '/user/me/documents/mypics/2018/summer vacation' }}
        />
    ))
