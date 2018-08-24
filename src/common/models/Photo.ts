import anselBookshelf from './ansel-bookshelf';
import shortid from 'shortid'

import config from '../config';

import { ExifOrientation, BookshelfClass } from './DataTypes'
import Tag, { TagType, TagId } from './Tag'
import Version, { VersionType } from './Version'

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
    non_raw: string | null,
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
    /** Example: 'SONY DSC-N2' */
    camera: string | null,
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

export interface PhotoDetail {
    versions: VersionType[],
    tagIds: TagId[]
}

export interface PhotoWork {
    rotationTurns?: 1 | 2 | 3
    flagged?: true
}

export type PhotoSectionId = string
export type PhotoById = { [index: string]: PhotoType }
export interface PhotoSection {
    id: PhotoSectionId
    title: string
    count: number
    photoIds?: PhotoId[]
    photoData?: PhotoById
}
export type PhotoSectionById = { [index: string]: PhotoSection }


export type PhotoFilter = {
    readonly mainFilter:
        { readonly type: 'date', readonly date: string } |
        { readonly type: 'tag', readonly tagId: TagId } |
        { readonly type: 'trash' } |
        { readonly type: 'processed' } |
        null
    readonly showOnlyFlagged: boolean
}


export function generatePhotoId() {
    return shortid.generate()
}


export function getThumbnailPath(photoId: PhotoId): string {
    return `${config.thumbnailPath}/${photoId}.${config.workExt}`
}


export function getTotalRotationTurns(exifOrientation: ExifOrientation, photoWork: PhotoWork) {
    let exifRotationTurns = 0
    switch (exifOrientation) {
        case ExifOrientation.Right:  exifRotationTurns = 1; break
        case ExifOrientation.Bottom: exifRotationTurns = 2; break
        case ExifOrientation.Left:   exifRotationTurns = 3; break
    }
    return (exifRotationTurns + (photoWork.rotationTurns || 0)) % 4
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
