/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
/*global ace, LabEG*/

(function(){
    "use strict";
    
    var editor = ace.edit("editor");
    editor.setTheme("ace/theme/chrome");
    editor.getSession().setMode("ace/mode/html");
    
    var xmldocformatter = new LabEG.Lib.XMLDOCFormatter();
    
    document.getElementById("format").addEventListener("click", function(){
        editor.setValue(xmldocformatter.format(editor.getValue()));
        xmldocformatter.clear();
    });
        
}());