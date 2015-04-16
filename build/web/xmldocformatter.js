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
            charsForTabs: "    ",
            notPairedTags: "meta|link|img|br|input".split("|"),
            isMultilineAttributes: false
        };

        /**
         * @description Log events.
         * @param {string} message Log message.
         * @returns {undefined}
         */
        this.onLog = function (message) {
//            console.log("XMLFormatter log: ", message);
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
        var levelsTags = [];

        var i = 0; //just iterator

        var regexps = {
            Comment: /^<!--.*?-->/, // <!-- comment -->
            Tag: /^<[\s\S]*?>/,
            Text: /^[^<]+/, // just text
            Empty: /^(\r|\n|\r\n|\s|\t)+/ // new lines and spaces
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
                foundMatch = text.match(regexps.Empty);
                if (foundMatch) {
                    text = text.substring(foundMatch[0].length, text.length);

                    self.onLog(tabs + "Empty text node or new line.");
                    continue;
                }

                //html comment
                foundMatch = text.match(regexps.Comment);
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

                //tag
                foundMatch = text.match(regexps.Tag);
                if (foundMatch) {
                    text = text.substring(foundMatch[0].length, text.length);
                    foundMatch[0] = foundMatch[0]
                            .replace(/\r|\n|\r\n/g, "") //remove new lines
                            .replace(/\s{2,}/g, " ")
                            .replace(/^<\s/g, "<")
                            .replace(/\s>$/g, ">");

                    //level to down on tag </div>
                    if (foundMatch[0].match(/^<\//)) {

                        level -= 1;

                        if (levelsTags[level] !== foundMatch[0].match(/^<\/(.*?)[\s>]/)[1]) {
                            self.onWarning(
                                    "Not corrected closed tag: ",
                                    levelsTags[level],
                                    " - ",
                                    foundMatch[0].match(/^<\/(.*?)[\s>]/)[1]
                                    );
                        }
                    }

                    tabs = "";
                    for (i = 0; i < level; i += 1) {
                        tabs += self.options.charsForTabs;
                    }

                    //level to up on tag <div class="">
                    if (!foundMatch[0].match(/^<[!\/]/) && !foundMatch[0].match(/\/>$/)) {

                        levelsTags[level] = foundMatch[0].match(/^<(.*?)[\s>]/)[1];

                        //not need up increment, if tag not paired
                        if (self.options.notPairedTags.indexOf(levelsTags[level]) === -1) {
                            level += 1;
                        }
                    }

                    self.onLog(tabs + "Tag: " + foundMatch[0]);
                    formattedText += tabs + foundMatch[0] + self.options.charsBetweenTags;
                    continue;
                }

                //simple text
                foundMatch = text.match(regexps.Text);
                if (foundMatch) {
                    text = text.substring(foundMatch[0].length, text.length);
                    foundMatch[0] = foundMatch[0]
                            .replace(/\r|\n|\r\n/g, "")
                            .replace(/\s{2,}/g, " ");

                    tabs = "";
                    for (i = 0; i < level; i += 1) {
                        tabs += self.options.charsForTabs;
                    }

                    self.onLog(tabs + "Simple text: " + foundMatch[0]);
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
                    self.onLog("Parsing All block ended, ending is cached to next cycle.");
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
        this.clear = function () {
            residueString = "";
            level = 0;
            levelsTags.length = 0;
        };

    };

    if (typeof module != "undefined" && module !== null && module.exports) {
        module.exports = LabEG.Lib.XMLDOCFormatter;
    } else if (typeof define === "function" && define.amd) {
        define(function () {
            return LabEG.Lib.XMLDOCFormatter;
        });
    }

}());