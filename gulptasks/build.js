
(function () {
    "use strict";

    var gulp = require('gulp');

    var concat = require('gulp-concat');
    var rename = require("gulp-rename");
    var uglify = require('gulp-uglify');
    var jshint = require('gulp-jshint');
    var jslint = require('gulp-jslint-simple');
    var browserify = require('gulp-browserify');

    gulp.task('js-cs', function () {
        gulp.src('./src/**/*.js')
                .pipe(jshint())
                .pipe(jslint.run({}));
    });

    gulp.task('web-js', function () {
        gulp.src('./src/web/xmldocformatter.js')
                .pipe(concat('xmldocformatter.js'))
                .pipe(gulp.dest('./build/web/'))
                .pipe(uglify())
                .pipe(rename({suffix: ".min"}))
                .pipe(gulp.dest('./build/web/'));
    });

    gulp.task('node-js', function () {
        gulp.src('./src/nodejs/xmldocformatter.js')
                .pipe(browserify())
                .pipe(gulp.dest('./build/nodejs/'))
                .pipe(uglify())
                .pipe(rename({suffix: ".min"}))
                .pipe(gulp.dest('./build/nodejs/'));
    });

    gulp.task('watch', ['web-js', 'node-js'], function () {
        gulp.watch('./src/**/*.js', ['web-js', 'node-js']);
    });

    gulp.task('release', ['web-js', 'node-js']);

}());