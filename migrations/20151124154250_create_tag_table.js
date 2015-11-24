exports.up = function(knex, Promise) {
  return knex.schema.createTable('tags', function(table) {
    table.string('id', 10).primary().unique();
    table.string('title');
    table.string('slug');
    table.timestamps();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('tags');
};
