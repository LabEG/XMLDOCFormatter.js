[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/LabEG/XMLDOCFormatter.js?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

# XMLDOCFormatter
A JavaScript Framework for formatting is like XML documents, such as XML, HTML, JSP, PHP and other.
## !!!Development version, not for production yet.

##### Demo: 
Demo of working on site:
 [nodejs html](http://labeg.github.io/XMLDOCFormatter.js/?demo=content/examples/nodejs.html), 
 [codewinds html](http://labeg.github.io/XMLDOCFormatter.js/?demo=content/examples/codewinds.html), 
 [rbc rss](http://labeg.github.io/XMLDOCFormatter.js/?demo=content/examples/rbc.news.rss).

##### Questions, Bugs, Feature requests:
All this you can leave in the appropriate section [issues](https://github.com/LabEG/XMLDOCFormatter.js/issues). 

## Using
##### In browser:
XMLDOCFormatter can you use in browser for show unformatted text as formatted:
```javascript
var xmldocformatter = new XMLDOCFormatter();
xmldocformatter.format("<html>text for formatting<html>");
xmldocformatter.clear();
```

##### In streams:
XMLDOCFormatter has an internal memory in which it stores information about the last formatted block, whereby it is possible to format streams.
```javascript
var xmldocformatter = new XMLDOCFormatter();

var fileReadStream = fs.createReadStream("input.html");
var fileWriteStream = fs.createWriteStream("output.html",);

fileReadStream.on('data', function (chunk) {
    fileWriteStream.write(xmldocformatter.format(chunk));
});

fileReadStream.on('end', function () {
    xmldocformatter.clear();
    fileWriteStream.end();
});
```
XMLDOCFormatter is an object, so you can create multiple objects with different options and asynchronously to format multiple streams.

##### In nodejs:
XMLDOCFormatter can you use in konsole with node.js:
```sh
node xmldocformatter.js --source path/to/source.html --output path/to/output.html;
```

## Options
##### In web:
- `charsBetweenTags`, chars bettwen symbol > and <, example \r\n.
- `charsForTabs`, chars for tabs, example \t or "    ".
- `notPairedTags`, tags without closed tags, as array, example [link, br, img].
- `isMultilineAttributes`, make attributes on multiline.

##### In node.js:
- `--source` or `-s`, source file or directory for formatting.
- `--output` or `-o`, output path for formatted file or directory.
- `--streambuffer` or `-sb`, buffer size for streamreader.

## Code Style
- Closure compiler compability,
- Using JSDoc for documentations,
- OOP oriented,
- All code checking by JSHint and JSLint,
- Browserify, RequireJS, CommonJS, AMD compatibility.
