var gulp = require("gulp");
var babel = require("gulp-babel");
var less = require('gulp-less');

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

gulp.task('default', ['babel', 'styles' ]);
