import React from 'react'

import {addSection} from 'test-ui/core/UiTester'

import ImportProgressButton from 'app/ui/ImportProgressButton'
import Toolbar from 'app/ui/widget/Toolbar'


addSection('ImportProgressButton')
    .setDecorator(testView =>
        <Toolbar style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
            {testView}
        </Toolbar>
    )
    .add('scanning dirs', context => (
        <ImportProgressButton
            progress={{ phase: 'scan-dirs', total: 1240, processed: 0, added: 0, removed: 0, currentPath: '/user/me/documents/mypics/2016/birthday party' }}
        />
    ))
    .add('cleanup', context => (
        <ImportProgressButton
            progress={{ phase: 'cleanup', total: 10442, processed: 0, added: 0, removed: 15, currentPath: null }}
        />
    ))
    .add('import-photos', context => (
        <ImportProgressButton
            progress={{ phase: 'import-photos', total: 10542, processed: 1250, added: 440, removed: 21, currentPath: '/user/me/documents/mypics/2018/summer vacation' }}
        />
    ))
    .add('import-photos 0%', context => (
        <ImportProgressButton
            progress={{ phase: 'import-photos', total: 0, processed: 0, added: 0, removed: 21, currentPath: null }}
        />
    ))
    .add('error', context => (
        <ImportProgressButton
            progress={{ phase: 'error', total: 12742, processed: 5780, added: 565, removed: 37, currentPath: '/user/me/documents/mypics/2019/xmas' }}
        />
    ))
