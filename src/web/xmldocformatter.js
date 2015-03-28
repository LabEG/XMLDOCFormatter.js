/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

/*global module*/

var LabEG = this.LabEG || {};
LabEG.Lib = LabEG.Lib || {};

if (LabEG.Lib.XMLDOCFormatter) {
    throw new Error("Redefine: LabEG.Lib.XMLFormatter");
}

(function () {
    "use strict";

    /**
     * @description 
     * Library for formatting XML documents, like as XML, HTML, JSP, PHP.
     * 
     * @constructor
     * @param {{charsBetweenTags: string, charsForTabs: string}} inOptions Options for working XMLFormatter
     * @returns {string}
     */
    LabEG.Lib.XMLDOCFormatter = function (inOptions) {

        var self = this;

        this.options = {
            charsBetweenTags: "\r\n",
            charsForTabs: "    "
        };

        /**
         * @description Log events.
         * @param {string} message Log message.
         * @returns {undefined}
         */
        this.onLog = function (message) {
            console.log("XMLFormatter log: ", message);
        };

        /**
         * @description Warning events.
         * @param {string} message Warning message.
         * @returns {undefined}
         */
        this.onWarning = function (message) {
            console.warn("XMLFormatter warning: ", message);
        };

        /**
         * @description Errors events.
         * @param {string} message Error message.
         * @returns {undefined}
         */
        this.onError = function (message) {
            console.error("XMLFormatter error: ", message);
        };

        var residueString = "";

        var formattedText = "";
        var endOfParsing = false;
        var level = 0;
        var foundMatch = [];
        var cycles = 0;
        var tabs = "";

        var i = 0; //just iterator

        var regexps = {
            XMLTagOpen: /^<[^!\/].*?>/, // <div id="test" class="test">
            XMLTagClose: /^<\/.*?>/, // </div>
            XMLComment: /^<!--.*?-->/, // <!-- comment -->
            HTMLSpecTag: /^<![^<>]*?>/, // <!Doctype html>
            HTMLNotPairedTags: /^<(meta|link|img|br)[^<>]*?>/, //<meta charset="utf-8">
            XMLTagWithoutPaier: /^<[^<>]*?\/>/, // <link href="/favicon.ico" />
            SimpleText: /^[^<>]+/, // just text
            EmptyTextNode: /^(\r|\n|\r\n|\s)+/ // new lines and spaces
        };
        
        /**
         * @description Method for formatting text
         * @param {string} text Text for formatting.
         * @returns {string}
         */
        this.format = function (text) {
            
            formattedText = "";
            endOfParsing = false;
            cycles = 0;

            text = residueString + text;

            while (!endOfParsing) {

                //empty text node or new lines
                foundMatch = text.match(regexps.EmptyTextNode);
                if (foundMatch) {
                    text = text.substring(foundMatch[0].length, text.length);

                    tabs = "";
                    for (i = 0; i < level; i += 1) {
                        tabs += self.options.charsForTabs;
                    }

                    self.onLog(tabs + "Empty text node or new line.");
                    continue;
                }

                //tag without paire.
                foundMatch = text.match(regexps.XMLTagWithoutPaier);
                if (foundMatch) {
                    text = text.substring(foundMatch[0].length, text.length);

                    tabs = "";
                    for (i = 0; i < level; i += 1) {
                        tabs += self.options.charsForTabs;
                    }

                    self.onLog(tabs + "Tag without pair: " + foundMatch[0]);
                    formattedText += tabs + foundMatch[0] + self.options.charsBetweenTags;
                    continue;
                }

                //not paired html tags. Example: meta, link.
                foundMatch = text.match(regexps.HTMLNotPairedTags);
                if (foundMatch) {
                    text = text.substring(foundMatch[0].length, text.length);

                    tabs = "";
                    for (i = 0; i < level; i += 1) {
                        tabs += self.options.charsForTabs;
                    }

                    self.onLog(tabs + "Not paired html tag: " + foundMatch[0]);
                    formattedText += tabs + foundMatch[0] + self.options.charsBetweenTags;
                    continue;
                }

                //open tags
                foundMatch = text.match(regexps.XMLTagOpen);
                if (foundMatch) {
                    text = text.substring(foundMatch[0].length, text.length);

                    tabs = "";
                    for (i = 0; i < level; i += 1) {
                        tabs += self.options.charsForTabs;
                    }
                    level += 1;

                    self.onLog(tabs + "Tag open: " + foundMatch[0]);
                    formattedText += tabs + foundMatch[0] + self.options.charsBetweenTags;
                    continue;
                }

                //close tags
                foundMatch = text.match(regexps.XMLTagClose);
                if (foundMatch) {
                    text = text.substring(foundMatch[0].length, text.length);

                    level -= 1;
                    tabs = "";
                    for (i = 0; i < level; i += 1) {
                        tabs += self.options.charsForTabs;
                    }

                    self.onLog(tabs + "Tag close: " + foundMatch[0]);
                    formattedText += tabs + foundMatch[0] + self.options.charsBetweenTags;
                    continue;
                }

                //simple text
                foundMatch = text.match(regexps.SimpleText);
                if (foundMatch) {
                    text = text.substring(foundMatch[0].length, text.length);
                    foundMatch[0] = foundMatch[0].replace(/\r|\n|\r\n|\s{2,}/g);

                    tabs = "";
                    for (i = 0; i < level; i += 1) {
                        tabs += self.options.charsForTabs;
                    }

                    self.onLog(tabs + "Simple text: " + foundMatch[0]);
                    formattedText += tabs + foundMatch[0] + self.options.charsBetweenTags;
                    continue;
                }

                //html comment
                foundMatch = text.match(regexps.XMLComment);
                if (foundMatch) {
                    text = text.substring(foundMatch[0].length, text.length);

                    tabs = "";
                    for (i = 0; i < level; i += 1) {
                        tabs += self.options.charsForTabs;
                    }

                    self.onLog(tabs + "HTML comment: " + foundMatch[0]);
                    formattedText += tabs + foundMatch[0] + self.options.charsBetweenTags;
                    continue;
                }

                //html spec tags
                foundMatch = text.match(regexps.HTMLSpecTag);
                if (foundMatch) {
                    text = text.substring(foundMatch[0].length, text.length);

                    tabs = "";
                    for (i = 0; i < level; i += 1) {
                        tabs += self.options.charsForTabs;
                    }

                    self.onLog(tabs + "HTML spec tag: " + foundMatch[0]);
                    formattedText += tabs + foundMatch[0] + self.options.charsBetweenTags;
                    continue;
                }

                if (text.length === 0) {
                    endOfParsing = true;
                    residueString = "";
                    self.onLog("Parsing All block complete.");
                    continue;
                }

                if (text.length > 0) {
                    residueString = text;
                    endOfParsing = true;
                    self.onError("Parsing All block ended, ending is cached to next cycle.");
                    continue;
                }

                cycles += 1;
                if (cycles > 3) {
                    endOfParsing = true;
                    this.onWarning("Cycles limit.");
                }
            }
            return formattedText;
        };
        
        /**
         * @description 
         * Clear memory of XMLDOCFormatter.
         * Need if you begin formatting new stream or new document.
         * 
         * @returns {undefined}
         */
        this.clear = function (){
            residueString = "";
            level = 0;
        };
        
    };
    
    if (module){
        module.exports = LabEG.Lib.XMLDOCFormatter;
    }
    
}());