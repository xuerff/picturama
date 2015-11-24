exports.up = function(knex, Promise) {
  return knex.schema.table('photos', function (t) {
    t.integer('tag_id')
      .index()
      .references('id')
      .inTable('photos');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('photos', function (t) {
    t.dropColumn('tag_id');
  });
};
