import { remote, ipcRenderer } from 'electron'
import classNames from 'classnames'
import React from 'react'
import { Button, ButtonGroup } from '@blueprintjs/core'

import { PhotoId, PhotoType, PhotoWork, PhotoSection } from '../../../common/models/Photo'
import { rotate } from '../../../common/util/EffectsUtil'
import { bindMany } from '../../../common/util/LangUtil'

import FaIcon from '../widget/icon/FaIcon'
import MdRotateLeftIcon from '../widget/icon/MdRotateLeftIcon'
import MdRotateRightIcon from '../widget/icon/MdRotateRightIcon'
import MdSaveAlt from '../widget/icon/MdSaveAlt'
import Toolbar from '../widget/Toolbar'

const dialog = remote.dialog;


interface Props {
    className?: any
    showOnlyFlagged: boolean
    isShowingTrash: boolean
    photosCount: number
    selectedSection: PhotoSection | null
    selectedPhotoIds: PhotoId[]
    openExport: () => void
    updatePhotoWork: (photo: PhotoType, update: (photoWork: PhotoWork) => void) => void
    setPhotosFlagged: (photos: PhotoType[], flag: boolean) => void
    toggleShowOnlyFlagged: () => void
}

export default class LibraryTopBar extends React.Component<Props, undefined> {

    constructor(props: Props) {
        super(props)

        bindMany(this, 'showSidebar', 'deleteModal', 'rotateLeft', 'rotateRight', 'toggleFlagged')
    }

    showSidebar() {
        window.dispatchEvent(new Event('core:toggleSidebar'))
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
        for (const photoId of props.selectedPhotoIds) {
            const photo = props.selectedSection.photoData[photoId]
            props.updatePhotoWork(photo, photoWorks => rotate(photoWorks, turns))
        }
    }

    toggleFlagged() {
        const props = this.props
        const newFlagged = !this.getSelectedAreFlagged()

        let photosToChange = []
        for (const photoId of props.selectedPhotoIds) {
            const photo = props.selectedSection.photoData[photoId]
            if (!!photo.flag !== newFlagged) {
                photosToChange.push(photo)
            }
        }

        this.props.setPhotosFlagged(photosToChange, newFlagged)
    }

    getSelectedAreFlagged() {
        const props = this.props
        if (!props.selectedSection || props.selectedPhotoIds.length === 0) {
            return false
        } else {
            for (const photoId of props.selectedPhotoIds) {
                const photo = props.selectedSection.photoData[photoId]
                if (!photo.flag) {
                    return false
                }
            }
            return true
        }
    }

    render() {
        const props = this.props
        const hasSelection = props.selectedPhotoIds.length > 0
        const selectedAreFlagged = this.getSelectedAreFlagged()
        return (
            <Toolbar className={classNames(props.className, 'LibraryTopBar')}>
                <Button className="LibraryTopBar-showSidebar" onClick={this.showSidebar} title="Show sidebar [tab]">
                    <FaIcon name="bars" />
                </Button>
                <Button
                    className={classNames('LibraryTopBar-toggleButton', { isActive: props.showOnlyFlagged })}
                    onClick={this.props.toggleShowOnlyFlagged}
                    title={ props.showOnlyFlagged ? 'Show all' : 'Show only flagged' }
                >
                    <FaIcon name="flag" />
                </Button>

                <div className="pull-right">
                    <ButtonGroup>
                        <Button disabled={!hasSelection} onClick={this.rotateLeft} title="Rotate left">
                            <MdRotateLeftIcon/>
                        </Button>
                        <Button disabled={!hasSelection} onClick={this.rotateRight} title="Rotate right">
                            <MdRotateRightIcon/>
                        </Button>
                    </ButtonGroup>
                    <Button
                        className={classNames('LibraryTopBar-toggleButton', { isActive: selectedAreFlagged })}
                        disabled={!hasSelection}
                        onClick={this.toggleFlagged}
                        title={selectedAreFlagged ? 'Remove flag' : 'Flag'}
                    >
                        <FaIcon name="flag" />
                    </Button>
                    <Button disabled={!hasSelection} onClick={this.props.openExport} title="Export">
                        <MdSaveAlt/>
                    </Button>
                    {this.props.isShowingTrash &&
                        <Button disabled={props.photosCount === 0} onClick={this.deleteModal}>
                            <FaIcon name="trash" />
                        </Button>
                    }
                </div>
            </Toolbar>
        )
    }
}
