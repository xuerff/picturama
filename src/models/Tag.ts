import slug from '../lib/slug';

import anselBookshelf from './ansel-bookshelf';

import Photo from './photo';


export interface TagType {
    id: string,
    title: string,
    slug: string,
    created_at: number,
    updated_at: number | null,
}

interface TagConstructor {
    new (): TagType
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

}) as TagConstructor
