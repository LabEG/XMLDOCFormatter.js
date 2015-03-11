/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

(function (){
    "use strict";
    
    var fs = require("fs");
    
    var fileForRead = "/tmp/streamtest.html";
    var fileForWrite = "/tmp/write.html";
    
    var fileReadStream = fs.createReadStream(fileForRead, {encoding: 'utf8', autoClose: true, highWaterMark: 4 * 1024});
    var fileWriteStream = fs.createWriteStream(fileForWrite, {encoding: 'utf8', autoClose: true});
    
    var options = {
        "charsBetweenTags":"\r\n\r\n",
        "charsForTabs":"    "
    };
    
    var lastString = "";
    var endOfParsing = false;
    var level = 0;
    var foundMatch;
    var cycles = 0;
    var tabs = '';
    
    var i = 0;
    
    var regexpXMLTagOpen = /^<[^!\/].*?>/;
    var regexpXMLTagClose = /^<\/.*?>/;
    var regexpHTMLComment = /^<!--.*?-->/;
    var regexpHTMLNotPairedTags = /^<(meta|link|img|br)[^<>]*?>/;
    var regexpHTMLSpecTag = /^<!.*?>/;
    var regexpXMLTagWithoutPaier = /^<[^<>]*?\/>/;
    var regexpSimpleText = /^[^<>]+/;
    
    fileReadStream.on('data', function(data){
        endOfParsing = false;
        data = lastString + data.replace(/>(\r|\n|\r\n|\s)+</g, '><');
        
        while(!endOfParsing){
            
            //tag without paire.
            foundMatch = data.match(regexpXMLTagWithoutPaier)
            if (foundMatch){
                data = data.substring(foundMatch[0].length, data.length);
                
                tabs = "";
                for (i =0; i < level; i += 1){
                    tabs += options.charsForTabs;
                }
                
                console.log("Tag without pair: ", tabs + foundMatch[0]);
                fileWriteStream.write(tabs + foundMatch[0] + options.charsBetweenTags);
                continue;
            }
            
            //not paired html tags. Example: meta, link.
            foundMatch = data.match(regexpHTMLNotPairedTags)
            if (foundMatch){
                data = data.substring(foundMatch[0].length, data.length);
                
                tabs = "";
                for (i =0; i < level; i += 1){
                    tabs += options.charsForTabs;
                }
                
                console.log("Not paired html tag: ", tabs + foundMatch[0]);
                fileWriteStream.write(tabs + foundMatch[0] + options.charsBetweenTags);
                continue;
            }
            
            //open tags
            foundMatch = data.match(regexpXMLTagOpen)
            if (foundMatch){
                data = data.substring(foundMatch[0].length, data.length);
                
                tabs = "";
                for (i =0; i < level; i += 1){
                    tabs += options.charsForTabs;
                }
                level += 1;
                
                console.log("Tag open: ", tabs + foundMatch[0]);
                fileWriteStream.write(tabs + foundMatch[0] + options.charsBetweenTags);
                continue;
            }
            
            //close tags
            foundMatch = data.match(regexpXMLTagClose)
            if (foundMatch){
                data = data.substring(foundMatch[0].length, data.length);
                
                level -= 1;
                tabs = "";
                for (i =0; i < level; i += 1){
                    tabs += options.charsForTabs;
                }
                
                console.log("Tag close: ", tabs + foundMatch[0]);
                fileWriteStream.write(tabs + foundMatch[0] + options.charsBetweenTags);
                continue;
            }
            
            //simple text
            foundMatch = data.match(regexpSimpleText)
            if (foundMatch){
                data = data.substring(foundMatch[0].length, data.length);
                
                tabs = "";
                for (i =0; i < level; i += 1){
                    tabs += options.charsForTabs;
                }
                
                console.log("Simple text: ", tabs + foundMatch[0]);
                fileWriteStream.write(tabs + foundMatch[0] + options.charsBetweenTags);
                continue;
            }
            
            //html comment
            foundMatch = data.match(regexpHTMLComment)
            if (foundMatch){
                data = data.substring(foundMatch[0].length, data.length);
                
                tabs = "";
                for (i =0; i < level; i += 1){
                    tabs += options.charsForTabs;
                }
                
                console.log("HTML comment: ", tabs + foundMatch[0]);
                fileWriteStream.write(tabs + foundMatch[0] + options.charsBetweenTags);
                continue;
            }
            
            //html spec tags, example <!Doctype html>
            foundMatch = data.match(regexpHTMLSpecTag)
            if (foundMatch){
                data = data.substring(foundMatch[0].length, data.length);
                
                tabs = "";
                for (i =0; i < level; i += 1){
                    tabs += options.charsForTabs;
                }
                
                console.log("HTML spec tag: ", tabs + foundMatch[0]);
                fileWriteStream.write(tabs + foundMatch[0] + options.charsBetweenTags);
                continue;
            }
            
            if (data.length === 0){                
                endOfParsing = true;
                lastString = "";
                console.log("Parsing All block complete.");
                continue;
            }
            
            if(data.length > 0){
                lastString = data;
                endOfParsing = true;
                console.log("Parsing All block ended, ending is cached to next cycle.");
                continue;
            }
            
            cycles += 1;
            if (cycles > 3){
                endOfParsing = true;
                console.log("Cycles limit.");
            }
        }
    });
    
    fileReadStream.on('end', function(){
        console.log('End stream.');
        fileWriteStream.end();
    });
    
}());