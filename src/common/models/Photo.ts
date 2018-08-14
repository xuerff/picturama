import anselBookshelf from './ansel-bookshelf';
import shortid from 'shortid'

import config from '../config';

import { ExifOrientation, BookshelfClass } from './DataTypes'
import Tag, { TagType } from './Tag'
import Version from './Version'

shortid.characters(config.characters);


/** Example: 'B1m80éAMpf' */
export type PhotoId = string
export interface PhotoType {
    /** Example: 'B1m80éAMpf' */
    id: PhotoId,
    /** Example: 'IMG_9700' */
    title: string,
    /** The original image. Example: '/specs/photos/IMG_9700.JPG' */
    master: string,
    /** The width of the original image (in px). */
    master_width: number | null
    /** The height of the original image (in px). */
    master_height: number | null
    /** Contains non-raw version of raw images. Example: '../dot_ansel/thumbs/B1m80éAMpf.webp' */
    thumb: string | null,
    /** Example: 'JPG' */
    extension: string,
    /** Whether the image is flagged. */
    flag: 0 | 1,
    /** Example: 0  (for saving Dates work too) */
    created_at: number | Date,
    /** Example: null */
    updated_at: number | null,
    /** Example: 1 (= ExifOrientation.Up) */
    orientation: ExifOrientation,
    /** Example: 0.0166 */
    exposure_time: number,
    /** Example: 0 */
    iso: number,
    /** Example: 5 */
    focal_length: number,
    /** Example: 5.6 */
    aperture: number,
    /** Example: '2016-09-18' */
    date: string,
    /** Example: 0 */
    trashed: 0 | 1
}

export interface PhotoWork {
    rotationTurns?: 1 | 2 | 3
    flagged?: true
}


export function generatePhotoId() {
    return shortid.generate()
}


export function getThumbnailPath(photoId: PhotoId): string {
    return `${config.thumbnailPath}/${photoId}.${config.workExt}`
}


export default anselBookshelf.Model.extend({
    tableName: 'photos',

    versions: function() {
        return this.hasMany(Version);
    },

    tags: function() {
        return this.belongsToMany(Tag);
    },

    initialize: function() {
        this.on('creating', model => {
            model.set('id', generatePhotoId())
        })
    }
}) as BookshelfClass<PhotoType>
