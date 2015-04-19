
/*global module*/

(function () {
    "use strict";

    var yargs = require("yargs");

    var ARGS = yargs
            .usage("\r\n" +
                " xmlformatter.js --source path/to/file.html [--output sample_new.html] [options]" + 
                "\r\n\r\n" +
                " Not asign obyazatel'nye parameters."
            )
    
            .example(
                'xmlformatter.js --source /tmp/sample.html',
                'for formating one file with defaults options'
            )
            .example(
                'xmlformatter.js -s ./sample.html -o ./sample_new.html -v',
                'for formating one file to new file with options'
            )
    
            .describe("source", "File or directory of XML files for formatting.")
            .describe("output", "Path for save formatted files.")
            .describe("streambuffer", "Size of stream reader buffer.")
            .describe("notpairedtags", "Not paired tags, by commas.")
            .describe("version", "Version of application.")
    
            .demand("source")

            .alias("s", "source")
            .alias("o", "output")
            .alias("sb", "streambuffer")
            .alias("npt", "notpairedtags")
            .alias("V", "version")
            
            .string("source")
            .string("output")
            .string("streambuffer")
            .string("notpairedtags")
            
            .boolean("version")
    
            .help('h')
            .alias('h', 'help')
    
            .epilog('LabEG. 2015.')
    
            .strict()
    
            .wrap(null)

            .argv;
            

    if (module) {
        module.exports = ARGS;
    }

}());