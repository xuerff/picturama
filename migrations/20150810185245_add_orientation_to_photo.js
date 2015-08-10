exports.up = function(knex, Promise) {
  return knex.schema.table('photos', function (t) {
    t.integer('orientation');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('photos', function (t) {
    t.dropColumn('orientation');
  });
};
