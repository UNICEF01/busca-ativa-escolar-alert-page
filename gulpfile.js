// Include gulp
var gulp = require('gulp');


// Include Our Plugins
var jshint = require('gulp-jshint');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var imagemin = require('gulp-imagemin');


// Lint Task
gulp.task('lint', function() {
    return gulp.src('resources/js/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// Min Images
gulp.task('imagemin', function () {
    return gulp.src('resources/images/*')
        .pipe(imagemin({
            progressive: true
        }))
        .pipe(gulp.dest('public/images'));
});
// Compile Our Sass
gulp.task('sass', function() {
    return gulp.src('resources/sass/*.scss')
        .pipe(sass())
        .pipe(gulp.dest('public/css'));
});

// Concatenate & Minify JS
gulp.task('scripts', function() {
    return gulp.src('resources/js/*.js')
        .pipe(concat('all.js'))
        .pipe(gulp.dest('public/js'))
        .pipe(rename('all.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('public/js'));
});

// Watch Files For Changes
gulp.task('watch', function() {
    gulp.watch('js/*.js', ['lint', 'scripts']);
    gulp.watch('resources/scss/*.scss', ['sass']);
});

// Default Task
gulp.task('default', ['lint', 'sass', 'imagemin','scripts', 'watch']);