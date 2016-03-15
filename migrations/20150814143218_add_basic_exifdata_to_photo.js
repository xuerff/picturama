exports.up = function(knex, Promise) {
  return knex.schema.table('photos', function (t) {
    t.float('exposure_time');
    t.integer('iso');
    t.integer('focal_length');
    t.float('aperture');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('photos', function (t) {
    t.dropColumn('exposure_time');
    t.dropColumn('iso');
    t.dropColumn('focal_length');
    t.dropColumn('aperture');
  });
};
