exports.up = function(knex, Promise) {
  return knex.schema.table('photos', function (t) {
    t.date('date');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('photos', function (t) {
    t.dropColumn('date');
  });
};
