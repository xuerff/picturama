var gulp = require('gulp')
var less = require('gulp-less')
var concat = require('gulp-concat')
var eslint = require('gulp-eslint')
var mocha = require('gulp-mocha')
var electronMocha = require('gulp-electron-mocha')
var bump = require('gulp-bump')
var sourcemaps = require('gulp-sourcemaps')
var typescript = require('gulp-typescript')
var childProcess = require('child_process')
var electron = require('electron')
var del = require('del')
var env = require('gulp-env')
var packager = require('electron-packager')

var npmPkgs = require('./package.json')


var typescriptSettings = {
  target: 'es5',
  jsx: 'react',
  module: 'commonjs',
  moduleResolution: 'node',
  sourceMap: true,
  allowJs: true,
  emitDecoratorMetadata: true,
  experimentalDecorators: true,
  removeComments: true,
  noImplicitAny: false,
  suppressImplicitAnyIndexErrors: true
}


gulp.task("transpile", ['lint'], () => {
  return gulp.src([ 'src/**/*.js', 'src/**/*.ts', 'src/**/*.tsx' ])
    .pipe(sourcemaps.init())
    .pipe(typescript(typescriptSettings))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest("dist"));
});

gulp.task("transpile-tests", () => {
  return gulp.src([ 'tests/**/*.js', 'tests/**/*.ts', 'src/**/*.tsx' ])
    .pipe(sourcemaps.init())
    .pipe(typescript(typescriptSettings))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest("tests-dist"));
});

gulp.task('styles', ['lint'], () => {
  return gulp.src('src/less/index.less')
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


gulp.task('run', [ 'transpile', 'styles' ],
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

gulp.task('test', ['transpile-tests'], () => {
  return gulp.src('tests-dist/**/*.spec.js', { read: false })
    .pipe(electronMocha({ 
      electronPath: electron, 
      electronMocha: { renderer: true }
    }));
});

gulp.task('prepare-src', [ 'transpile', 'styles', 'clear-build' ], 
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
    .map((dependency) => `node_modules/${dependency}/**/*`)

  return gulp.src(modulesSrc, { base: 'node_modules' })
    .pipe(gulp.dest("build/prepared/node_modules"))
});

gulp.task('package', [ 'prepare-src', 'prepare-modules' ], (cb) => {
  let opts = {
    arch: 'x64',
    dir: './build/prepared',
    ignore: /(txt$|md$|jpg$|jpeg$|\.cc$|license|example|tests|node_modules\/libraw\/vendor)/i,
    platform: 'linux',
    asar: false,
    out: './build',
    version: npmPkgs.devDependencies['electron']
  };

  packager(opts, function done (err, appPath) { 
    console.log('done packaging', appPath);
    cb();
    process.exit(0);
  });
});

gulp.task('increment-buildnum', (cb) => {
  return gulp.src('./package.json')
    .pipe(bump({ type: 'patch' }))
    .pipe(gulp.dest('./'));
});

gulp.task('mocha', () => {
  gulp.src('specs/**/*.spec.js', {read: false})
    .pipe(mocha({reporter: 'list'}))
});

gulp.task('default', [ 'set-env', 'lint', 'transpile', 'styles', 'run' ]);

gulp.task('build', [ 
  'lint', 
  'clear-build', 
  'transpile', 
  'styles', 
  'increment-buildnum',
  'prepare-src', 
  'prepare-modules', 
  'package'
]);

gulp.task('clear', [
  'set-env',
  'clear-db',
  'transpile',
  'styles',
  'run'
]);

gulp.task('tests', ['set-env-test', 'lint', 'transpile', 'styles', 'mocha']);
