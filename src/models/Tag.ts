import slug from '../lib/slug';

import anselBookshelf from './ansel-bookshelf';

import Photo, { PhotoType } from './photo';
import { BookshelfClass, BookshelfModel, BookshelfCollection } from './DataTypes'


export type TagId = number
export interface TagType {
    id: TagId,
    title: string,
    slug: string,
    created_at: number,
    updated_at: number | null,
}

export default anselBookshelf.Model.extend({
    tableName: 'tags',

    photos: function() {
        return this.belongsToMany(Photo);
    },

    initialize: function() {
        this.on('creating', model => {
            let sluggedTitle = slug(model.get('title'));

            model.set('slug', sluggedTitle);
        });
    }

}) as BookshelfClass<TagType, { photos(): BookshelfCollection<PhotoType> }>
