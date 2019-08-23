import React from 'react'

import Logo from 'app/ui/widget/icon/Logo'

import { addSection } from 'test-ui/core/UiTester'


addSection('Icon')
    .add('Logo', context => (
        <Logo size={400}/>
    ))
