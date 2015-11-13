exports.up = function(knex, Promise) {
  return knex.schema.createTable('photos', function (table) {
    table.string('id', 10).primary().unique();
    table.string('title');
    table.string('master');
    table.string('thumb');
    table.string('thumb_250');
    table.string('extension', 10);
    table.boolean('flag').defaultTo(false);
    table.timestamps();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('photos');
};
