import * as classNames from 'classnames'
import * as React from 'react'

import { PhotoType } from '../../../common/models/Photo'


interface Props {
    className?: any
    photo: PhotoType
}

class PictureInfo extends React.Component<Props, undefined> {
    shutterSpeed(exposureTime) {
        const zeros = -Math.floor(Math.log(exposureTime) / Math.log(10));

        return '1/' + Math.pow(10, zeros);
    }

    displayTags() {
        if (!this.props.photo.hasOwnProperty('tags'))
            return '';

        if (this.props.photo.tags.length === 0)
            return 'none';

        return this.props.photo.tags
            .map(tag => tag.title)
            .join(', ');
    }

    render() {
        const props = this.props
        const photo = props.photo
        return (
            <div className={classNames(props.className, "PictureInfo picture-info shadow--2dp")}>
                <ul>
                    <li className="title">{photo.title}</li>
                    <li>ISO: {photo.iso}</li>
                    <li>f/{photo.aperture}</li>
                    <li>@ {this.shutterSpeed(photo.exposure_time)}</li>
                    <li>v#: {photo.versionNumber}</li>
                    <li>Orientation: {photo.orientation}</li>
                    <li>Flag: {photo.flag}</li>
                    <li className="tags">Tags: {this.displayTags()}</li>
                </ul>
            </div>
        )
    }
}

export default PictureInfo
