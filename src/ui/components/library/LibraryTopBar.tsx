import { remote, ipcRenderer } from 'electron'
import classNames from 'classnames'
import React from 'react'
import { Button } from '@blueprintjs/core'

import { Device } from 'common/models/DataTypes'
import { PhotoId, PhotoType, PhotoWork, PhotoSectionId, PhotoFilter } from 'common/models/Photo'
import { TagId, TagById } from 'common/models/Tag'
import { bindMany } from 'common/util/LangUtil'

import FaIcon from 'ui/components/widget/icon/FaIcon'
import PhotoActionButtons from 'ui/components/widget/PhotoActionButtons'
import Toolbar from 'ui/components/widget/Toolbar'

import './LibraryTopBar.less'
import LibraryFilterButton from './LibraryFilterButton'

const dialog = remote.dialog;


interface Props {
    className?: any
    libraryFilter: PhotoFilter
    tagIds: TagId[]
    tagById: TagById
    devices: Device[]
    selectedSectionId: PhotoSectionId | null
    selectedPhotos: PhotoType[]
    isShowingTrash: boolean
    isShowingInfo: boolean
    photosCount: number
    fetchTags(): void
    setLibraryFilter(newFilter: PhotoFilter): void
    openExport: (sectionId: PhotoSectionId, photoIds: PhotoId[]) => void
    updatePhotoWork: (photo: PhotoType, update: (photoWork: PhotoWork) => void) => void
    setPhotosFlagged: (photos: PhotoType[], flag: boolean) => void
    movePhotosToTrash: (photos: PhotoType[]) => void
    restorePhotosFromTrash: (photos: PhotoType[]) => void
    toggleShowInfo: () => void
}

export default class LibraryTopBar extends React.Component<Props> {

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
                <LibraryFilterButton
                    libraryFilter={props.libraryFilter}
                    tagIds={props.tagIds}
                    tagById={props.tagById}
                    devices={props.devices}
                    fetchTags={props.fetchTags}
                    setLibraryFilter={props.setLibraryFilter}
                />

                <div className="pull-right">
                    {this.props.isShowingTrash &&
                        <Button
                            className="LibraryTopBar-emptyTrash"
                            icon="trash"
                            text="Empty trash"
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
