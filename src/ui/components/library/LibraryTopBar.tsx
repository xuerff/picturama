import { remote, ipcRenderer } from 'electron'
import classNames from 'classnames'
import React from 'react'
import { Button } from '@blueprintjs/core'

import { PhotoId, PhotoType, PhotoWork, PhotoSectionId } from '../../../common/models/Photo'
import { bindMany } from '../../../common/util/LangUtil'

import FaIcon from '../widget/icon/FaIcon'
import PhotoActionButtons from '../widget/PhotoActionButtons'
import Toolbar from '../widget/Toolbar'

import './LibraryTopBar.less'

const dialog = remote.dialog;


interface Props {
    className?: any
    selectedSectionId: PhotoSectionId,
    selectedPhotos: PhotoType[]
    isShowingTrash: boolean
    isShowingInfo: boolean
    photosCount: number
    showOnlyFlagged: boolean
    openExport: (sectionId: PhotoSectionId, photoIds: PhotoId[]) => void
    updatePhotoWork: (photo: PhotoType, update: (photoWork: PhotoWork) => void) => void
    setPhotosFlagged: (photos: PhotoType[], flag: boolean) => void
    movePhotosToTrash: (photos: PhotoType[]) => void
    restorePhotosFromTrash: (photos: PhotoType[]) => void
    toggleShowOnlyFlagged: () => void
    toggleShowInfo: () => void
}

export default class LibraryTopBar extends React.Component<Props, undefined> {

    constructor(props: Props) {
        super(props)

        bindMany(this, 'showSidebar', 'emptyTrashModal')
    }

    showSidebar() {
        window.dispatchEvent(new Event('core:toggleSidebar'))
    }

    emptyTrashModal() {
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

    render() {
        const props = this.props
        return (
            <Toolbar className={classNames(props.className, 'LibraryTopBar')}>
                <Button className="LibraryTopBar-showSidebar" minimal={true} onClick={this.showSidebar} title="Show sidebar [tab]">
                    <FaIcon name="bars" />
                </Button>
                <Button
                    className={classNames('LibraryTopBar-toggleButton', { isActive: props.showOnlyFlagged })}
                    minimal={true}
                    active={props.showOnlyFlagged}
                    onClick={this.props.toggleShowOnlyFlagged}
                    title={ props.showOnlyFlagged ? 'Show all' : 'Show only flagged' }
                >
                    <FaIcon name="flag" />
                </Button>

                <div className="pull-right">
                    {this.props.isShowingTrash &&
                        <Button
                            className="LibraryTopBar-emptyTrash"
                            icon="trash"
                            text="Empty trash"
                            intent={props.photosCount === 0 ? null : 'warning'}
                            disabled={props.photosCount === 0}
                            onClick={this.emptyTrashModal}
                        />
                    }
                    <PhotoActionButtons
                        selectedSectionId={props.selectedSectionId}
                        selectedPhotos={props.selectedPhotos}
                        isShowingTrash={props.isShowingTrash}
                        isShowingInfo={props.isShowingInfo}
                        openExport={props.openExport}
                        updatePhotoWork={props.updatePhotoWork}
                        setPhotosFlagged={props.setPhotosFlagged}
                        movePhotosToTrash={props.movePhotosToTrash}
                        restorePhotosFromTrash={props.restorePhotosFromTrash}
                        toggleShowInfo={props.toggleShowInfo}
                    />
                </div>
            </Toolbar>
        )
    }
}
