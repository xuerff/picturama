import { ipcRenderer } from 'electron'
import classNames from 'classnames'
import React from 'react'
import { Button, MaybeElement, Alert } from '@blueprintjs/core'

import { PhotoId, Photo, PhotoWork, PhotoSectionId } from 'common/CommonTypes'
import { msg } from 'common/i18n/i18n'
import { bindMany } from 'common/util/LangUtil'

import PhotoActionButtons from 'app/ui/widget/PhotoActionButtons'
import Toolbar from 'app/ui/widget/Toolbar'

import './LibraryTopBar.less'


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

interface State {
    showEmptyTrashAlert: boolean
}

export default class LibraryTopBar extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props)
        bindMany(this, 'onShowEmptyTrashAlert', 'onEmptyTrashCancelled', 'onEmptyTrashConfirmed')
        this.state = { showEmptyTrashAlert: false }
    }

    private onShowEmptyTrashAlert() {
        this.setState({ showEmptyTrashAlert: true })
    }

    private onEmptyTrashCancelled() {
        this.setState({ showEmptyTrashAlert: false })
    }

    private onEmptyTrashConfirmed() {
        this.setState({ showEmptyTrashAlert: false })
        ipcRenderer.send('empty-trash', true)
    }

    render() {
        const { props, state } = this
        return (
            <Toolbar
                className={classNames(props.className, 'LibraryTopBar')}
                isTopBar={true}
                isLeft={true}
                isRight={!props.isShowingInfo}
            >
                {props.leftItem}

                <Toolbar.Spacer/>

                {props.isShowingTrash &&
                    <Button
                        className="LibraryTopBar-emptyTrash"
                        icon="trash"
                        text={msg('LibraryTopBar_emptyTrash')}
                        intent={props.photosCount === 0 ? undefined : 'warning'}
                        disabled={props.photosCount === 0}
                        onClick={this.onShowEmptyTrashAlert}
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

                <Alert
                    className='LibraryTopBar-emptyTrashAlert'
                    isOpen={state.showEmptyTrashAlert}
                    icon='trash'
                    intent='danger'
                    cancelButtonText={msg('common_cancel')}
                    confirmButtonText={msg('LibraryTopBar_moveToTrash')}
                    onCancel={this.onEmptyTrashCancelled}
                    onConfirm={this.onEmptyTrashConfirmed}
                >
                    {msg('LibraryTopBar_emptyTrashQuestion')}
                </Alert>
            </Toolbar>
        )
    }
}
