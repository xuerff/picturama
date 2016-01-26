import gulp from "gulp";
import babel from "gulp-babel";
import less from 'gulp-less';
import concat from 'gulp-concat';
import eslint from 'gulp-eslint';
import mocha from 'gulp-mocha';
import childProcess from 'child_process';
import electron from 'electron-prebuilt';
import del from 'del';
import env from 'gulp-env';

import config from './src/config';
import knexFile from './knexfile';

let knex = require('knex')(knexFile.development);

gulp.task("babel", ['lint'], () => {
  return gulp.src("src/**/*.js")
    .pipe(babel())
    .pipe(gulp.dest("dist"));
});

gulp.task('styles', ['lint'], () => {
  return gulp.src('src/source.less')
    .pipe(less())
    .pipe(gulp.dest('dist'));
});

gulp.task('lint', () => {
  return gulp.src('./src/**/*.js')
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('run', [ 'babel', 'styles' ],
  () => {
    childProcess.spawn(electron, ['.'], { stdio: 'inherit' }); 
  });

gulp.task('clear-db', () => {
  return del([
    'dot-ansel/db.sqlite3',
    'versions/**/*',
    'dot-ansel/thumbs/**/*',
    'dot-ansel/thumbs-250/**/*',
  ]);
});

gulp.task('migrate', [ 'clear-db' ], () => {
  return knex.migrate.latest();
});

gulp.task('set-env', () => {
  env({
    vars: {
      ANSEL_DEV_MODE: true
    }
  })
});

gulp.task('test', () => {
  return gulp.src('tests/**/*.spec.js', { read: false })
    .pipe(mocha({
      compilers: {
        js: babel
      }
    }))
    .once('end', () => {
      process.exit();
    });
});

gulp.task('default', [ 'set-env', 'lint', 'babel', 'styles', 'run' ]);

gulp.task('clear', [
  'set-env',
  'clear-db',
  'migrate',
  'babel',
  'styles',
  'run'
]);
