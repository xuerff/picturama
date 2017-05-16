exports.up = function(knex, Promise) {
  return knex.schema.table('photos', function (t) {
    t.boolean('trashed').defaultTo(false);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('photos', function (t) {
    t.dropColumn('trashed');
  });
};
