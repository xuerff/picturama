import * as classNames from 'classnames'
import * as React from 'react'
import { connect } from 'react-redux';
import { remote, ipcRenderer } from 'electron';
import * as PropTypes from 'prop-types'

import Button from '../widget/Button'
import ButtonGroup from '../widget/ButtonGroup'
import FaIcon from '../widget/icon/FaIcon'
import RotateLeftIcon from '../widget/icon/RotateLeftIcon'
import RotateRightIcon from '../widget/icon/RotateRightIcon'
import Toolbar from '../widget/Toolbar'
import { PhotoType } from '../../models/photo'
import AppState from '../../reducers/AppState'
import { rotate } from '../../util/EffectsUtil'
import { bindMany } from '../../util/LangUtil'
import { fetchPhotoWork } from '../../IpcClient'

const dialog = remote.dialog;


interface Props {
    className?: any
    currentDate: string | null
    showOnlyFlagged: boolean
    isShowingTrash: boolean
    highlighted: number[]
    photos: PhotoType[]
    actions: any
}

export default class LibraryTopBar extends React.Component<Props, undefined> {

    constructor(props) {
        super(props)

        bindMany(this, 'showSidebar', 'toggleFlagged', 'deleteModal', 'rotateLeft', 'rotateRight')
    }

    showSidebar() {
        window.dispatchEvent(new Event('core:toggleSidebar'))
    }

    toggleFlagged() {
        this.props.actions.toggleFlagged(
            this.props.currentDate,
            !this.props.showOnlyFlagged
        )
    }

    deleteModal() {
        dialog.showMessageBox({
            type: 'question',
            message: 'Are you sure you want to empty the trash?',
            buttons: [ 'Move picture(s) to trash', 'Cancel' ]
        }, index => {
            if (index === 0) {
                ipcRenderer.send('empty-trash', true)
            }
        })
    }

    rotateLeft() {
        this.rotate(-1)
    }

    rotateRight() {
        this.rotate(1)
    }

    rotate(turns: number) {
        const props = this.props
        for (const photoIndex of props.highlighted) {
            const photo = props.photos[photoIndex]
            fetchPhotoWork(photo.master)
                .then(photoWork => {
                    const nextEffects = rotate(photoWork.effects, turns)
                    props.actions.storeEffects(photo, nextEffects)
                })
                .catch(error => console.error('Rotating photo failed', error))
        }
    }

    render() {
        const props = this.props
        return (
            <Toolbar className={classNames(props.className, 'LibraryTopBar')}>
                <Button className="LibraryTopBar-showSidebar" onClick={this.showSidebar}>
                    <FaIcon name="bars" />
                </Button>

                <div className="pull-right">
                    <ButtonGroup>
                        <Button enabled={props.highlighted.length > 0} onClick={this.rotateLeft} tip="Rotate images left">
                            <RotateLeftIcon/>
                        </Button>
                        <Button enabled={props.highlighted.length > 0} onClick={this.rotateRight} tip="Rotate images right">
                            <RotateRightIcon/>
                        </Button>
                    </ButtonGroup>
                    {this.props.isShowingTrash &&
                        <Button onClick={this.deleteModal}>
                            <FaIcon name="trash" />
                        </Button>
                    }
                    <Button
                        className={classNames('LibraryTopBar-toggleFlagged', { isActive: props.showOnlyFlagged })}
                        onClick={this.toggleFlagged}
                    >
                        <FaIcon name="flag" />
                    </Button>
                </div>
            </Toolbar>
        )
    }
}
