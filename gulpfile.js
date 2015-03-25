/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

(function () {
    "use strict";
    var gulp = require('gulp');

    var requireDir = require('require-dir');
    var dir = requireDir('./gulptasks');

    gulp.task('release', ['web-js', 'node-js']);

    gulp.task('default', ['release']);

}());