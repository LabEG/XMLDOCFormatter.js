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

    var filesForRead = [args.source];
    var filesForWrite = [args.output || args.source];
    var streambuffer = args.streambuffer || 4096;

    var formatFile = function (fileForRead, fileForWrite) {
        
        var level = 0;
        var residueString = "";
        var resultOfFormatt = "";
        
        var xmldocformatter = new XMLDOCFormatter();
        
        //console.log("Begin formatting: ", fileForRead, fileForWrite);

        var fileReadStream = fs.createReadStream(fileForRead, {encoding: 'utf8', autoClose: true, highWaterMark: streambuffer});
        var fileWriteStream = fs.createWriteStream(fileForWrite + ".tmp", {encoding: 'utf8', autoClose: true});

        fileReadStream.on('data', function (chunk) {
            //console.log("Writing chunk on disk.");
            fileWriteStream.write(xmldocformatter.format(chunk));
        });

        fileReadStream.on('end', function () {
            //console.log('End stream.');
            fs.rename(fileForWrite + ".tmp", fileForWrite);
            fileWriteStream.end();
        });
        
    };

    var i = 0;
    for (i = 0; i < filesForRead.length; i += 1) {
        //fuction with async read and write
        formatFile(filesForRead[i], filesForWrite[i]);
    }

}());