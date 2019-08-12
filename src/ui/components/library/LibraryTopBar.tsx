import { remote, ipcRenderer } from 'electron'
import classNames from 'classnames'
import React from 'react'
import { Button, MaybeElement } from '@blueprintjs/core'

import { PhotoId, Photo, PhotoWork, PhotoSectionId } from 'common/CommonTypes'
import { msg } from 'common/i18n/i18n'
import { bindMany } from 'common/util/LangUtil'

import PhotoActionButtons from 'ui/components/widget/PhotoActionButtons'
import Toolbar from 'ui/components/widget/Toolbar'

import './LibraryTopBar.less'

const dialog = remote.dialog;


interface Props {
    className?: any
    leftItem?: MaybeElement
    selectedSectionId: PhotoSectionId | null
    selectedPhotos: Photo[]
    isShowingTrash: boolean
    isShowingInfo: boolean
    photosCount: number
    openExport: (sectionId: PhotoSectionId, photoIds: PhotoId[]) => void
    updatePhotoWork: (photo: Photo, update: (photoWork: PhotoWork) => void) => void
    setPhotosFlagged: (photos: Photo[], flag: boolean) => void
    movePhotosToTrash: (photos: Photo[]) => void
    restorePhotosFromTrash: (photos: Photo[]) => void
    toggleShowInfo: () => void
}

export default class LibraryTopBar extends React.Component<Props> {

    constructor(props: Props) {
        super(props)
        bindMany(this, 'emptyTrashModal')
    }

    emptyTrashModal() {
        dialog.showMessageBox({
            type: 'question',
            message: msg('LibraryTopBar_emptyTrashQuestion'),
            buttons: [ msg('LibraryTopBar_moveToTrash'), msg('common_cancel') ]
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
                {props.leftItem}

                <div className="pull-right">
                    {this.props.isShowingTrash &&
                        <Button
                            className="LibraryTopBar-emptyTrash"
                            icon="trash"
                            text={msg('LibraryTopBar_emptyTrash')}
                            intent={props.photosCount === 0 ? undefined : 'warning'}
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
