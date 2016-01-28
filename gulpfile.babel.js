import gulp from "gulp";
import babel from "gulp-babel";
import less from 'gulp-less';
import concat from 'gulp-concat';
import eslint from 'gulp-eslint';
import childProcess from 'child_process';
import electron from 'electron-prebuilt';
import del from 'del';
import env from 'gulp-env';
import packager from 'electron-packager';

import config from './src/config';
import knexFile from './knexfile';

import npmPkgs from './package.json';

//console.log('npm-pkgs', Object.keys(npmPkgs.dependencies));

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

gulp.task('clear-build', () => {
  return del([ 'build/**/*' ]);
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

gulp.task('prepare-src', [ 'babel', 'styles', 'clear-build' ], 
  () => {
    return gulp
      .src([
        "dist/**/*", 
        "static/**/*",
        "menus/**/*",
        "migrations/**/*",
        "knexfile.js",
        "package.json"
      ], { base: '.' })
      .pipe(gulp.dest("build/prepared"));
  });

gulp.task('prepare-modules', [ 'prepare-src' ], () => {
  let modulesSrc = Object.keys(npmPkgs.dependencies)
    .map((dependency) => `node_modules/${dependency}/**/*`)

  return gulp.src(modulesSrc, { base: 'node_modules' })
    .pipe(gulp.dest("build/prepared/node_modules"))
});

gulp.task('package', [ 'prepare-src', 'prepare-modules' ], (cb) => {
  let opts = {
    arch: 'x64',
    dir: './build/prepared',
    ignore: /(test|example|samples|LICENSE|text$|md$|jpg$|jpeg$|cc$)/i,
    platform: 'linux',
    asar: false,
    out: './build',
    //prune: true,
    version: '0.36.0'
  };

  packager(opts, function done (err, appPath) { 
    console.log('done packaging', appPath);
    cb();
  });
});

gulp.task('default', [ 'set-env', 'lint', 'babel', 'styles', 'run' ]);

gulp.task('build', [ 
  'lint', 
  'clear-build', 
  'babel', 
  'styles', 
  'prepare-src', 
  'prepare-modules', 
  'package' 
]);

gulp.task('clear', [
  'set-env',
  'clear-db',
  'babel',
  'styles',
  'run'
]);
