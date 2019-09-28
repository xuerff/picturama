import React from 'react'
import classnames from 'classnames'
import { Button, Classes } from '@blueprintjs/core'

import { msg } from 'common/i18n/i18n'

import Toolbar from 'app/ui/widget/Toolbar'


export interface Props {
    className?: any
    onDone(): void
}

export default class CropModeToolbar extends React.Component<Props> {

    render() {
        const { props } = this
        return (
            <Toolbar className={classnames(props.className, 'CropModeToolbar')} isLeft={true}>
                <span className='pull-right'>
                    <Button
                        intent='success'
                        onClick={props.onDone}
                    >
                        <span className={Classes.BUTTON_TEXT}>{msg('CropModeToolbar_done')}</span>
                    </Button>
                </span>
            </Toolbar>
        )
    }

}
