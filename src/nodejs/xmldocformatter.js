/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/* jshint node: true */
/* global LabEG */

(function () {
    "use strict";

    var fs = require("fs");
    var args = require("./arguments.js");
    var XMLDOCFormatter = require("../web/xmldocformatter.js");
    var JSBeautify = require("js-beautify");
    var Comb = require('csscomb');

    var filesForRead = [args.source];
    var filesForWrite = [args.output || args.source];
    var streambuffer = args.streambuffer || null;

    var formatFile = function (fileForRead, fileForWrite) {

        var xmldocformatter = new XMLDOCFormatter();
        var comb = new Comb('csscomb');

        xmldocformatter.onScript = function (code) {
            return JSBeautify(code, { indent_size: 4, indent_char: " " });
        };

        xmldocformatter.onStyle = function (code) {
            return comb.processString(JSBeautify.css(code, { indent_size: 4, indent_char: " " }));
        };

        if (typeof args.notpairedtags === "string") {
            xmldocformatter.options.notPairedTags = args.notpairedtags.replace(/\s+/g, "").split(",");
        }

        //console.log("Begin formatting: ", fileForRead, fileForWrite);

        var fileReadStream = fs.createReadStream(fileForRead, { encoding: 'utf8', autoClose: true, highWaterMark: streambuffer });
        var fileWriteStream = fs.createWriteStream(fileForWrite + ".tmp", { encoding: 'utf8', autoClose: true });

        fileReadStream.on('data', function (chunk) {
            //            console.log("Writing chunk on disk.");
            fileWriteStream.write(xmldocformatter.format(chunk));
        });

        fileReadStream.on('end', function (chunk) {
            //            console.log('End stream.');
            fs.rename(fileForWrite + ".tmp", fileForWrite);
            fileWriteStream.end();
        });

    };

    var i = 0;
    for (i = 0; i < filesForRead.length; i += 1) {
        //fuction with async read and write
        formatFile(filesForRead[i], filesForWrite[i]);
    }

} ());