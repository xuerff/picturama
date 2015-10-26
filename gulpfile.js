var gulp = require("gulp");
var babel = require("gulp-babel");
var less = require('gulp-less');
//var jshint = require('gulp-jshint');
//var stylish = require('jshint-stylish');
var concat = require('gulp-concat');
var eslint = require('gulp-eslint');

gulp.task("babel", function () {
  return gulp.src("src/**/*.js")
    .pipe(babel())
    .pipe(gulp.dest("dist"));
});

gulp.task('mdl-js', function() {
  return gulp.src('./node_modules/material-design-lite/src/**/*.js')
    .pipe(concat('material-design-lite.js'))
    .pipe(gulp.dest("dist"));
});

gulp.task('mdl-styles', function() {
  return gulp.src('./node_modules/material-design-lite/dist/material.css')
    //.pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('dist'));
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
//gulp.task('lint', function() {
//  return gulp.src('./src/**/*.js')
//    .pipe(jshint())
//    .pipe(jshint.reporter(stylish));
//});

gulp.task('default', ['babel', 'mdl-js', 'mdl-styles', 'styles' ]);
