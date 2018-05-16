import slug from '../lib/slug';

import anselBookshelf from './ansel-bookshelf';

import Photo from './photo';
import { BookshelfClass } from './DataTypes'


export interface TagType {
    id: string,
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

}) as BookshelfClass<TagType>
