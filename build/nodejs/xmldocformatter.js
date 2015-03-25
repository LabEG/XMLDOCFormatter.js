/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/* jshint node: true */
/* global LabEG */

(function(){
    "use strict";    
    
//    var fs = require("fs");                     
    var args = require("./arguments.js");
    var xmldocformatter = require("../web/xmldocformatter.js");
        
    console.log('Work: ', args);
    
    var fileForRead = args.source;
    var fileForWrite = args.oputput;

    var fileReadStream = fs.createReadStream(fileForRead, {encoding: 'utf8', autoClose: true, highWaterMark: 4 * 1024});
    var fileWriteStream = fs.createWriteStream(fileForWrite, {encoding: 'utf8', autoClose: true});

    var xmlformatter = new XMLFormatter();    
    
    fileReadStream.on('data', function (data) {
        console.log("Writing chunk on disk.");
        fileWriteStream.write(xmlformatter.format(data));        
    });

    fileReadStream.on('end', function () {
        console.log('End stream.');
        fileWriteStream.end();
    });

    
}());