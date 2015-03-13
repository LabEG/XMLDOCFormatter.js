/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/* jshint node: true */
/* global LabEG */

(function(){
    "use strict";    
    
    var fs = require("fs");
    
    //using
    var XMLFormatter = LabEG.Lib.XMLFormatter;

    var fileForRead = "/tmp/streamtest.html";
    var fileForWrite = "/tmp/write.html";

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