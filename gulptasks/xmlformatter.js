/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

(function () {
    "use strict";

    var gulp = require('gulp');

    var concat = require('gulp-concat');
    var rename = require("gulp-rename");
    var uglify = require('gulp-uglify');
    var jshint = require('gulp-jshint');
    var jslint = require('gulp-jslint-simple');

    var webjs = [
        './src/web/xmlformatter.js'
    ];
    
    var nodejs = [
        './src/web/xmlformatter.js',
        './src/nodejs/nodewrapper.js'
    ];
    
    gulp.task('web-cs', function () {
        gulp.src('./src/**/*.js')
                .pipe(jshint())
                .pipe(jslint.run({}));
    });
    
    gulp.task('web-js', function () {
        gulp.src(webjs)
                .pipe(concat('xmlformatter.js'))
                .pipe(gulp.dest('./build/web/'))
                .pipe(uglify())
                .pipe(rename({suffix: ".min"}))
                .pipe(gulp.dest('./build/web/'));
    });
    
    gulp.task('node-js', function () {
        gulp.src(nodejs)
                .pipe(concat('xmlformatter.js'))
                .pipe(gulp.dest('./build/nodejs/'))
                .pipe(uglify())
                .pipe(rename({suffix: ".min"}))
                .pipe(gulp.dest('./build/nodejs/'));
    });

    gulp.task('watch', ['web-js', 'node-js'], function () {
        gulp.watch('./src/**/*.js', ['web-js', 'node-js']);
    });

}());