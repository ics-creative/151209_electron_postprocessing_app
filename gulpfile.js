var gulp = require('gulp');
var typescript = require('gulp-typescript');
var concat = require('gulp-concat');
var browserSync = require("browser-sync");
var runSequence = require('run-sequence');
var plumber = require('gulp-plumber');
var notify = require('gulp-notify');
var rimraf = require('rimraf');
var uglify = require('gulp-uglify');

browserSync({
    server: {
        baseDir: "build"
    }
});
gulp.task('build-minify', function () {
    gulp.src(['src/ts/**/*.ts'])
        .pipe(typescript({
            target: "ES6",
            removeComments: true,
            sortOutput: true
        }))
        .js
        .pipe(concat("main.js"))
        .pipe(uglify({
            preserveComments: 'some'
        }))
        .pipe(gulp.dest('build/js/'));
});

gulp.task('typescript-compile', function () {

    gulp.src(['src/ts/**/*.ts'])
        .pipe(typescript({
            target: "ES6",
            removeComments: false,
            sortOutput: true
        }))
        .js
        .pipe(concat("main.js"))
        .pipe(gulp.dest('build/js/'));

});

gulp.task('clean', function (callback) {
    rimraf('./build', callback);
});

gulp.task("clean-build", ['clean'], function () {
    runSequence(
        "build-minify",
        "copy-all"
    );
});

gulp.task('copy-all', ['copy-libs', 'copy-html', 'copy-css', 'copy-texture']);

gulp.task('copy-libs', function () {
    gulp.src('src/libs/**/*.js').pipe(gulp.dest('build/js/'));
});
gulp.task('copy-html', function () {
    gulp.src('src/index.html').pipe(gulp.dest('build/'));
    gulp.src('src/index.js').pipe(gulp.dest('build/'));
});
gulp.task('copy-texture', function () {
    gulp.src('src/texture/**/*.+(jpg|jpeg|png)').pipe(gulp.dest('build/texture/'));
});
gulp.task('copy-css', function () {
    gulp.src('src/css/*.css').pipe(gulp.dest('build/css/'));
});

// browserSync-browserSync-reload
gulp.task("reload", function () {
    browserSync.reload();
});

gulp.task("watch", ["reload"], function () {
    gulp.watch(['src/libs/**/*.js'], ['copy-libs']);
    gulp.watch(['src/index.html','src/index.js'], ['copy-html']);
    gulp.watch(['src/texture/**/*.+(jpg|jpeg|png)'], ['copy-texture']);
    gulp.watch(['src/css/*.*'], ['copy-css']);
    gulp.watch(['src/ts/**/*.*'], ['typescript-compile']);
    gulp.watch(['build/**/*.*'], ['reload']);
});
