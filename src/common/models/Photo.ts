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
    id: PhotoId,                // Example: 'B1m80éAMpf'
    title: string,              // Example: 'IMG_9700'
    master: string,             // Example: '/specs/photos/IMG_9700.JPG'
    thumb: string | null,       // Contains non-raw version of raw images. Example: '../dot_ansel/thumbs/B1m80éAMpf.webp'
    thumb_250: null,            // Never used. Thumbnails are created lazy by `src/ui/data/ImageProvider.ts`
    extension: string,          // Example: 'JPG'
    flag: 0 | 1,                // Example: 0  (for saving booleans work too)
    created_at: number | Date,  // Example: 0  (for saving Dates work too)
    updated_at: number | null,  // Example: null
    orientation: ExifOrientation, // Example: 1 (= ExifOrientation.Up)
    exposure_time: number,      // Example: 0.0166
    iso: number,                // Example: 0
    focal_length: number,       // Example: 5
    aperture: number,           // Example: 5.6
    date: string,               // Example: '2016-09-18'
    trashed: 0 | 1              // Example: 0
}

export interface PhotoWork {
    rotationTurns?: 1 | 2 | 3
    flagged?: true
}


export function generatePhotoId() {
    return shortid.generate()
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
