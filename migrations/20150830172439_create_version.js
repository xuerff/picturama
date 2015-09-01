exports.up = function(knex, Promise) {
  return knex.schema.createTable('versions', function (t) {
    t.increments();
    t.string('type', 10);
    t.string('original');
    t.string('master');
    t.string('output');
    t.integer('version');
    t.integer('photo_id').index().references('id').inTable('photos');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('versions');
};
