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
    .add('scanning dirs', context => (
        <ImportProgressButton
            progress={{ phase: 'scan-dirs', total: 120, processed: 0, added: 0, removed: 0, currentPath: '/user/me/documents/mypics/2016/birthday party' }}
        />
    ))
    .add('cleanup', context => (
        <ImportProgressButton
            progress={{ phase: 'cleanup', total: 1042, processed: 0, added: 0, removed: 15, currentPath: null }}
        />
    ))
    .add('importing photos', context => (
        <ImportProgressButton
            progress={{ phase: 'import-photos', total: 1042, processed: 120, added: 40, removed: 21, currentPath: '/user/me/documents/mypics/2018/summer vacation' }}
        />
    ))
    .add('error', context => (
        <ImportProgressButton
            progress={{ phase: 'error', total: 1042, processed: 570, added: 55, removed: 37, currentPath: '/user/me/documents/mypics/2019/xmas' }}
        />
    ))
