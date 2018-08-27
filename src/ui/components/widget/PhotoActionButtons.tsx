import classNames from 'classnames'
import React from 'react'
import { Button, ButtonGroup } from '@blueprintjs/core'

import { PhotoId, PhotoType, PhotoWork, PhotoSectionId } from '../../../common/models/Photo'
import { rotate } from '../../../common/util/EffectsUtil'
import { bindMany } from '../../../common/util/LangUtil'

import FaIcon from '../widget/icon/FaIcon'
import MdRotateLeftIcon from '../widget/icon/MdRotateLeftIcon'
import MdRotateRightIcon from '../widget/icon/MdRotateRightIcon'

import './PhotoActionButtons.less'


interface Props {
    selectedSectionId: PhotoSectionId,
    selectedPhotos: PhotoType[]
    isShowingTrash: boolean
    isShowingInfo: boolean
    openExport: (sectionId: PhotoSectionId, photoIds: PhotoId[]) => void
    updatePhotoWork: (photo: PhotoType, update: (photoWork: PhotoWork) => void) => void
    setPhotosFlagged: (photos: PhotoType[], flag: boolean) => void
    toggleShowInfo: () => void
}

export default class PhotoActionButtons extends React.Component<Props> {

    constructor(props: Props) {
        super(props)

        bindMany(this, 'rotateLeft', 'rotateRight', 'toggleFlagged', 'openExport')
    }

    rotateLeft() {
        this.rotate(-1)
    }

    rotateRight() {
        this.rotate(1)
    }

    rotate(turns: number) {
        const props = this.props
        for (const photo of props.selectedPhotos) {
            props.updatePhotoWork(photo, photoWorks => rotate(photoWorks, turns))
        }
    }

    toggleFlagged() {
        const props = this.props
        const newFlagged = !this.getSelectedAreFlagged()

        let photosToChange = []
        for (const photo of props.selectedPhotos) {
            if (!!photo.flag !== newFlagged) {
                photosToChange.push(photo)
            }
        }

        this.props.setPhotosFlagged(photosToChange, newFlagged)
    }

    getSelectedAreFlagged() {
        const props = this.props
        if (!props.selectedSectionId || props.selectedPhotos.length === 0) {
            return false
        } else {
            for (const photo of props.selectedPhotos) {
                if (!photo.flag) {
                    return false
                }
            }
            return true
        }
    }

    openExport() {
        const props = this.props
        const selectedPhotoIds = props.selectedPhotos.map(photo => photo.id)
        props.openExport(props.selectedSectionId, selectedPhotoIds)
    }

    render() {
        const props = this.props
        const hasSelection = props.selectedPhotos.length > 0
        const selectedAreFlagged = this.getSelectedAreFlagged()
        return (
            <>
                <ButtonGroup>
                    <Button minimal={true} disabled={!hasSelection} onClick={this.rotateLeft} title="Rotate left">
                        <MdRotateLeftIcon/>
                    </Button>
                    <Button minimal={true} disabled={!hasSelection} onClick={this.rotateRight} title="Rotate right">
                        <MdRotateRightIcon/>
                    </Button>
                </ButtonGroup>
                <Button
                    className={classNames('PhotoActionButtons-flagButton', { isActive: selectedAreFlagged })}
                    minimal={true}
                    active={selectedAreFlagged}
                    disabled={!hasSelection}
                    onClick={this.toggleFlagged}
                    title={selectedAreFlagged ? 'Remove flag' : 'Flag'}
                >
                    <FaIcon name="flag" />
                </Button>
                <Button
                    minimal={true}
                    icon="info-sign"
                    title={props.isShowingInfo ? "Hide photo info" : "Show photo info"}
                    active={props.isShowingInfo}
                    disabled={!hasSelection && !props.isShowingInfo}
                    onClick={this.props.toggleShowInfo}
                />
                <Button minimal={true} icon="export" disabled={!hasSelection} onClick={this.openExport} title="Export"/>
            </>
        )    
    }
}
