import { remote, ipcRenderer } from 'electron'
import * as classNames from 'classnames'
import * as React from 'react'

import Button from '../widget/Button'
import ButtonGroup from '../widget/ButtonGroup'
import FaIcon from '../widget/icon/FaIcon'
import MdRotateLeftIcon from '../widget/icon/MdRotateLeftIcon'
import MdRotateRightIcon from '../widget/icon/MdRotateRightIcon'
import MdSaveAlt from '../widget/icon/MdSaveAlt'
import Toolbar from '../widget/Toolbar'
import { PhotoId, PhotoType, PhotoWork } from '../../models/Photo'
import { PhotoData } from '../../state/reducers/library'
import { rotate } from '../../util/EffectsUtil'
import { bindMany } from '../../util/LangUtil'

const dialog = remote.dialog;


interface Props {
    className?: any
    showOnlyFlagged: boolean
    isShowingTrash: boolean
    photos: PhotoData
    highlightedPhotoIds: PhotoId[]
    openExport: () => void
    updatePhotoWork: (photo: PhotoType, update: (photoWork: PhotoWork) => void) => void
    setPhotosFlagged: (photos: PhotoType[], flag: boolean) => void
    toggleShowOnlyFlagged: () => void
}

export default class LibraryTopBar extends React.Component<Props, undefined> {

    constructor(props) {
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
        for (const photoId of props.highlightedPhotoIds) {
            const photo = props.photos[photoId]
            props.updatePhotoWork(photo, photoWorks => rotate(photoWorks, turns))
        }
    }

    toggleFlagged() {
        const props = this.props
        const newFlagged = !this.getHighlightedAreFlagged()

        let photosToChange = []
        for (const photoId of props.highlightedPhotoIds) {
            const photo = props.photos[photoId]
            if (!!photo.flag !== newFlagged) {
                photosToChange.push(photo)
            }
        }

        this.props.setPhotosFlagged(photosToChange, newFlagged)
    }

    getHighlightedAreFlagged() {
        const props = this.props
        if (props.highlightedPhotoIds.length === 0) {
            return false
        } else {
            for (const photoId of props.highlightedPhotoIds) {
                const photo = props.photos[photoId]
                if (!photo.flag) {
                    return false
                }
            }
            return true
        }
    }

    render() {
        const props = this.props
        const hasHighlight = props.highlightedPhotoIds.length > 0
        const highlightedAreFlagged = this.getHighlightedAreFlagged()
        return (
            <Toolbar className={classNames(props.className, 'LibraryTopBar')}>
                <Button className="LibraryTopBar-showSidebar" onClick={this.showSidebar} tip="Show sidebar [tab]">
                    <FaIcon name="bars" />
                </Button>
                <Button
                    className={classNames('LibraryTopBar-toggleButton', { isActive: props.showOnlyFlagged })}
                    onClick={this.props.toggleShowOnlyFlagged}
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
                    <Button enabled={hasHighlight} onClick={this.props.openExport} tip="Export">
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
