import classNames from 'classnames'
import React from 'react'

import { PhotoType, PhotoDetail } from '../../../common/models/Photo'


interface Props {
    className?: any
    photo: PhotoType
    photoDetail?: PhotoDetail
}

class PictureInfo extends React.Component<Props, undefined> {
    shutterSpeed(exposureTime) {
        const zeros = -Math.floor(Math.log(exposureTime) / Math.log(10));

        return '1/' + Math.pow(10, zeros);
    }

    displayTags() {
        const photoDetail = this.props.photoDetail

        if (!photoDetail) {
            return ''
        }

        if (photoDetail.tags.length === 0) {
            return 'none'
        }

        return photoDetail.tags
            .map(tag => tag.title)
            .join(', ')
    }

    render() {
        const props = this.props
        const photo = props.photo
        const photoDetail = props.photoDetail
        return (
            <div className={classNames(props.className, "PictureInfo picture-info shadow--2dp")}>
                <ul>
                    <li className="title">{photo.title}</li>
                    <li>ISO: {photo.iso}</li>
                    <li>f/{photo.aperture}</li>
                    <li>@ {this.shutterSpeed(photo.exposure_time)}</li>
                    <li>v#: {photoDetail && (photoDetail.versions.length + 1)}</li>
                    <li>Orientation: {photo.orientation}</li>
                    <li>Flag: {photo.flag}</li>
                    <li className="tags">Tags: {this.displayTags()}</li>
                </ul>
            </div>
        )
    }
}

export default PictureInfo
