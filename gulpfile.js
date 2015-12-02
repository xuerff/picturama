var gulp = require("gulp");
var babel = require("gulp-babel");
var less = require('gulp-less');
var concat = require('gulp-concat');
var eslint = require('gulp-eslint');
var childProcess = require('child_process');
var electron = require('electron-prebuilt');
var del = require('del');
var knexFile = require('./knexfile');
var knex = require('knex')(knexFile.development);

gulp.task("babel", function () {
  return gulp.src("src/**/*.js")
    .pipe(babel())
    .pipe(gulp.dest("dist"));
});

gulp.task('styles', function() {
  return gulp.src('src/source.less')
    .pipe(less())
    .pipe(gulp.dest('dist'));
});

gulp.task('lint', function () {
  return gulp.src('./src/**/*.js')
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('run', [ 'babel', 'styles' ],
  function () {
    childProcess.spawn(electron, ['.'], { stdio: 'inherit' }); 
  });

gulp.task('clear-db', function() {
  return del([
    'db.sqlite3',
    'versions/**/*',
    'thumbs/**/*',
    'thumbs-250/**/*',
  ]);
});

gulp.task('migrate', [ 'clear-db' ], function() {
  return knex.migrate.latest();
});

gulp.task('default', [ 'babel', 'styles', 'run' ]);

gulp.task('clear', [
  'clear-db',
  'migrate',
  'babel',
  'styles',
  'run'
]);
