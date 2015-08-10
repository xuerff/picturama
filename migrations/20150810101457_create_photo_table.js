exports.up = function(knex, Promise) {
  return knex.schema.createTable('photos', function (table) {
    table.increments();
    table.string('title');
    table.string('master');
    table.string('thumb');
    table.timestamps();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('photos');
};
