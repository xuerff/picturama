exports.up = function(knex, Promise) {
  return knex.schema.createTable('photos_tags', function (t) {
    t.integer('photo_id').index().references('id').inTable('photos');
    t.integer('tag_id').index().references('id').inTable('tags');

    t.primary([ 'photo_id', 'tag_id' ]);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('photos_tags');
};
