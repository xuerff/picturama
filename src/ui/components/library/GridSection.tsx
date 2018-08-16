import React from 'react'

import { PhotoId, PhotoType, PhotoSectionId, PhotoSection } from '../../../common/models/Photo'
import CancelablePromise from '../../../common/util/CancelablePromise'
import { bindMany } from '../../../common/util/LangUtil'

import { GridSectionLayout } from '../../UITypes'
import Picture from './Picture'

import './GridSection.less'


interface Props {
    section: PhotoSection
    layout: GridSectionLayout
    selectedPhotoIds: PhotoId[] | null
    getThumbnailSrc: (photo: PhotoType) => string
    createThumbnail: (photo: PhotoType) => CancelablePromise<string>
    onPhotoClick: (event: React.MouseEvent, sectionId: PhotoSectionId, photoId: PhotoId) => void
    onPhotoDoubleClick: (event: React.MouseEvent, sectionId: PhotoSectionId, photoId: PhotoId) => void
}

export default class GridSection extends React.Component<Props, undefined> {

    constructor(props: Props) {
        super(props)

        bindMany(this, 'renderPicture')
    }

    renderPicture(photoId: PhotoId, index: number) {
        const props = this.props
        const boxLayout = props.layout.boxes[index]

        return (
            <Picture
                key={photoId}
                sectionId={props.section.id}
                photo={props.section.photoData[photoId]}
                layoutBox={boxLayout}
                isHighlighted={props.selectedPhotoIds && props.selectedPhotoIds.indexOf(photoId) !== -1}
                getThumbnailSrc={props.getThumbnailSrc}
                createThumbnail={props.createThumbnail}
                onPhotoClick={props.onPhotoClick}
                onPhotoDoubleClick={props.onPhotoDoubleClick}
            />
        )
    }

    render() {
        const props = this.props

        return (
            <div className="GridSection">
                <div className="GridSection-head">{props.section.title}</div>
                <div className="GridSection-body" style={{ height: props.layout.containerHeight }}>
                    {props.section.photoIds && props.layout.boxes &&
                        props.section.photoIds.map(this.renderPicture)
                    }
                </div>
            </div>
        );
    }
}
