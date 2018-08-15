import React from 'react'

import { PhotoId, PhotoType, PhotoSectionId, PhotoSection } from '../../../common/models/Photo'
import CancelablePromise from '../../../common/util/CancelablePromise'
import Picture from './Picture'


interface Props {
    section: PhotoSection
    selectedPhotoIds: PhotoId[] | null
    getThumbnailSrc: (photo: PhotoType) => string
    createThumbnail: (photo: PhotoType) => CancelablePromise<string>
    onPhotoClick: (event: React.MouseEvent, sectionId: PhotoSectionId, photoId: PhotoId) => void
    onPhotoDoubleClick: (event: React.MouseEvent, sectionId: PhotoSectionId, photoId: PhotoId) => void
}

export default class GridSection extends React.Component<Props, undefined> {
    render() {
        const props = this.props
        return (
            <div className="GridSection">
                {props.section.photoIds && props.section.photoIds.map(photoId =>
                    <Picture
                        key={photoId}
                        sectionId={props.section.id}
                        photo={props.section.photoData[photoId]}
                        isHighlighted={props.selectedPhotoIds && props.selectedPhotoIds.indexOf(photoId) !== -1}
                        getThumbnailSrc={props.getThumbnailSrc}
                        createThumbnail={props.createThumbnail}
                        onPhotoClick={props.onPhotoClick}
                        onPhotoDoubleClick={props.onPhotoDoubleClick}
                    />
                )}
            </div>
        );
    }
}
