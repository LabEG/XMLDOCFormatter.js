
(function(){
    "use strict";
        
    var gulp = require('gulp');
    var exec = require('child_process').exec;

    gulp.task('test-1', function () {
        exec("node src/nodejs/xmldocformatter.js" +
                " --source test/unformatted/codewinds.html" + 
                " --output test/formatted/codewinds.html" +
                " --streambuffer 4096",
        function (err, data) {
            console.log(err);
            console.log(data.toString());
        });
    });
    
    gulp.task('test-2', function () {
        exec("node src/nodejs/xmldocformatter.js" +
                " --source test/unformatted/news_rss.xml" + 
                " --output test/formatted/news_rss.xml" +
                " --notpairedtags \"\"",
        function (err, data) {
            console.log(err);
            console.log(data.toString());
        });
    });
    
    gulp.task('test-3', function () {
        exec("node src/nodejs/xmldocformatter.js" +
                " --source test/unformatted/nodejs.html" + 
                " --output test/formatted/nodejs.html",
        function (err, data) {
            console.log(err);
            console.log(data.toString());
        });
    });
    
    gulp.task('test-4', function () {
        exec("node src/nodejs/xmldocformatter.js" +
                " --source test/unformatted/google.html" + 
                " --output test/formatted/google.html",
        function (err, data) {
            console.log(err);
            console.log(data.toString());
        });
    });
    
    gulp.task('test', ['test-1', 'test-2', 'test-3', 'test-4']);
    
}());