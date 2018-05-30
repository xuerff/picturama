import * as classNames from 'classnames'
import * as React from 'react'
import { connect } from 'react-redux';
import { remote, ipcRenderer } from 'electron';
import * as PropTypes from 'prop-types'

import Button from '../widget/Button'
import ButtonGroup from '../widget/ButtonGroup'
import FaIcon from '../widget/icon/FaIcon'
import MdRotateLeftIcon from '../widget/icon/MdRotateLeftIcon'
import MdRotateRightIcon from '../widget/icon/MdRotateRightIcon'
import MdSaveAlt from '../widget/icon/MdSaveAlt'
import Toolbar from '../widget/Toolbar'
import { PhotoType } from '../../models/photo'
import AppState from '../../reducers/AppState'
import { rotate } from '../../util/EffectsUtil'
import { bindMany } from '../../util/LangUtil'
import { fetchPhotoWork } from '../../BackgroundClient'

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

        bindMany(this, 'showSidebar', 'toggleShowOnlyFlagged', 'deleteModal', 'rotateLeft', 'rotateRight', 'toggleFlagged')
    }

    showSidebar() {
        window.dispatchEvent(new Event('core:toggleSidebar'))
    }

    toggleShowOnlyFlagged() {
        this.props.actions.toggleShowOnlyFlagged(
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

    toggleFlagged() {
        const props = this.props
        const newFlagged = !this.getHighlightedAreFlagged()

        for (const photoIndex of props.highlighted) {
            const photo = props.photos[photoIndex]
            if (!!photo.flag !== newFlagged) {
                props.actions.toggleFlag(photo)
            }
        }
    }

    getHighlightedAreFlagged() {
        const props = this.props
        if (props.highlighted.length === 0) {
            return false
        } else {
            for (const photoIndex of props.highlighted) {
                const photo = props.photos[photoIndex]
                if (!photo.flag) {
                    return false
                }
            }
            return true
        }
    }

    render() {
        const props = this.props
        const hasHighlight = props.highlighted.length > 0
        const highlightedAreFlagged = this.getHighlightedAreFlagged()
        return (
            <Toolbar className={classNames(props.className, 'LibraryTopBar')}>
                <Button className="LibraryTopBar-showSidebar" onClick={this.showSidebar} tip="Show sidebar [tab]">
                    <FaIcon name="bars" />
                </Button>
                <Button
                    className={classNames('LibraryTopBar-toggleButton', { isActive: props.showOnlyFlagged })}
                    onClick={this.toggleShowOnlyFlagged}
                    tip={ props.showOnlyFlagged ? 'Show all' : 'Show only flagged' }
                >
                    <FaIcon name="flag" />
                </Button>

                <div className="pull-right">
                    <ButtonGroup>
                        <Button enabled={hasHighlight} onClick={this.rotateLeft} tip="Rotate left">
                            <MdRotateLeftIcon/>
                        </Button>
                        <Button enabled={hasHighlight} onClick={this.rotateRight} tip="Rotate right">
                            <MdRotateRightIcon/>
                        </Button>
                    </ButtonGroup>
                    <Button
                        className={classNames('LibraryTopBar-toggleButton', { isActive: highlightedAreFlagged })}
                        enabled={hasHighlight}
                        onClick={this.toggleFlagged}
                        tip={highlightedAreFlagged ? 'Remove flag' : 'Flag'}
                    >
                        <FaIcon name="flag" />
                    </Button>
                    <Button enabled={hasHighlight} onClick={props.actions.openExport} tip="Export">
                        <MdSaveAlt/>
                    </Button>
                    {this.props.isShowingTrash &&
                        <Button onClick={this.deleteModal}>
                            <FaIcon name="trash" />
                        </Button>
                    }
                </div>
            </Toolbar>
        )
    }
}
