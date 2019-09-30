import React from 'react'
import classnames from 'classnames'
import { Button, Classes } from '@blueprintjs/core'

import { msg } from 'common/i18n/i18n'
import { bindMany } from 'common/util/LangUtil'
import { PhotoWork } from 'common/CommonTypes'

import RotateButtonGroup from 'app/ui/widget/RotateButtonGroup'
import Toolbar from 'app/ui/widget/Toolbar'
import { rotate } from 'common/util/EffectsUtil'


export interface Props {
    className?: any
    photoWork: PhotoWork | null
    onPhotoWorkEdited(photoWork: PhotoWork): void
    onDone(): void
}

export default class CropModeToolbar extends React.Component<Props> {

    constructor(props: Props) {
        super(props)
        bindMany(this, 'onRotate', 'onReset')
    }

    private onRotate(turns: number) {
        const prevPhotoWork = this.props.photoWork
        if (prevPhotoWork) {
            const photoWork = { ...prevPhotoWork }
            rotate(photoWork, turns, true)
            this.props.onPhotoWorkEdited(photoWork)
        }
    }

    private onReset() {
        const prevPhotoWork = this.props.photoWork
        if (prevPhotoWork) {
            const photoWork = { ...prevPhotoWork }
            delete photoWork.rotationTurns
            delete photoWork.tilt
            delete photoWork.cropRect
            this.props.onPhotoWorkEdited(photoWork)
        }
    }

    render() {
        const { props } = this
        const { photoWork } = props
        const hasGeometryOperations = !!(photoWork && (photoWork.rotationTurns || photoWork.tilt || photoWork.cropRect))

        return (
            <Toolbar className={classnames(props.className, 'CropModeToolbar')} isLeft={true}>
                <span className='pull-right'>
                    <RotateButtonGroup disabled={!props.photoWork} onRotate={this.onRotate}/>
                    <Button disabled={!hasGeometryOperations} onClick={this.onReset}>
                        <span className={Classes.BUTTON_TEXT}>{msg('CropModeToolbar_reset')}</span>
                    </Button>
                    <Button intent='success' onClick={props.onDone}>
                        <span className={Classes.BUTTON_TEXT}>{msg('CropModeToolbar_done')}</span>
                    </Button>
                </span>
            </Toolbar>
        )
    }

}
