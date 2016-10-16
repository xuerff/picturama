import gulp from "gulp";
import babel from "gulp-babel";
import less from 'gulp-less';
import concat from 'gulp-concat';
import eslint from 'gulp-eslint';
import mocha from 'gulp-mocha';
import electronMocha from 'gulp-electron-mocha';
import bumpBuildNumber from 'gulp-buildnum';
import childProcess from 'child_process';
import electron from 'electron-prebuilt';
import del from 'del';
import env from 'gulp-env';
import packager from 'electron-packager';

import config from './src/config';
import npmPkgs from './package.json';

gulp.task("babel", ['lint'], () => {
  return gulp.src("src/**/*.js")
    .pipe(babel())
    .pipe(gulp.dest("dist"));
});

gulp.task("babel-tests", () => {
  return gulp.src("tests/**/*.js")
    .pipe(babel())
    .pipe(gulp.dest("tests-dist"));
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

gulp.task('lint-tests', () => {
  return gulp.src('./tests/**/*.js')
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
    'dot-ansel/settings.json',
    'versions/**/*',
    'dot-ansel/thumbs/**/*',
    'dot-ansel/thumbs-250/**/*',
  ]);
});

gulp.task('clear-build', () => {
  return del([ 'build/**/*' ]);
});

gulp.task('set-env', () => {
  env({
    vars: {
      ANSEL_DEV_MODE: true
    }
  })
});

gulp.task('set-env-test', () => {
  env({
    vars: {
      ANSEL_DEV_MODE: true,
      ANSEL_TEST_MODE: true
    }
  })
});

gulp.task('test', ['babel-tests'], () => {
  return gulp.src('tests-dist/**/*.spec.js', { read: false })
    .pipe(electronMocha({ 
      electronPath: electron, 
      electronMocha: { renderer: true }
    }));
});

gulp.task('prepare-src', [ 'babel', 'styles', 'clear-build' ], 
  () => {
    return gulp
      .src([
        "dist/**/*", 
        "static/**/*",
        "menus/**/*",
        "keymaps/**/*",
        "migrations/**/*",
        "knexfile.js",
        "package.json"
      ], { base: '.' })
      .pipe(gulp.dest("build/prepared"));
  });

gulp.task('prepare-modules', [ 'prepare-src' ], () => {
  let modulesSrc = Object.keys(npmPkgs.dependencies)
    //.filter((dependency) => (dependency != 'electron-prebuilt'))
    .map((dependency) => `node_modules/${dependency}/**/*`)

  return gulp.src(modulesSrc, { base: 'node_modules' })
    .pipe(gulp.dest("build/prepared/node_modules"))
});

gulp.task('package', [ 'prepare-src', 'prepare-modules' ], (cb) => {
  let opts = {
    arch: 'x64',
    dir: './build/prepared',
    ignore: /(txt$|md$|jpg$|jpeg$|\.cc$|license|example|tests|node_modules\/libraw\/vendor|node_modules\/exiv2\/vendor)/i,
    platform: 'linux',
    asar: false,
    out: './build',
    version: npmPkgs.devDependencies['electron-prebuilt']
  };

  packager(opts, function done (err, appPath) { 
    console.log('done packaging', appPath);
    cb();
    process.exit(0);
  });
});

gulp.task('increment-buildnum', (cb) => {
  return gulp.src('./package.json')
    .pipe(bumpBuildNumber({key: "buildnum"}))
    .pipe(gulp.dest('./'));
});

gulp.task('mocha', () => {
  gulp.src('specs/run.spec.js', {read: false})
    .pipe(mocha({reporter: 'list'}))
});

gulp.task('default', [ 'set-env', 'lint', 'babel', 'styles', 'run' ]);

gulp.task('build', [ 
  'lint', 
  'clear-build', 
  'babel', 
  'styles', 
  'increment-buildnum',
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

gulp.task('tests', ['set-env-test', 'lint', 'babel', 'styles', 'mocha']);
