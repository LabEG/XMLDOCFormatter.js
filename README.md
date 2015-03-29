# XMLDOCFormatter
A JavaScript Framework for formatting is like XML documents, such as XML, HTML, JSP, PHP and other. Compatible with Closure Compiler.

### Develop version, not for production yet.

## Features
- Closure compiler compability,
- Using JSDoc for documentations,
- OOP oriented,
- All code checking by JSHint and JSLint.

## Sample
 Before formatting: 
```html
<html>    <head>  <title>  Title text    </title>
        <meta name="author" content="Jeff Barczewski"/>   <meta name="viewport"          content="width=device-width, initial-scale=1.0"/>       <link rel="icon"             type="image/png"    sizes="64x64"
              href="/assets/favicon-64.png"/>    </head>    <body>
        <img ng-src="{{img}}"   class="phone"    ng-repeat="img in phone.images"            ng-class="{active:mainImageUrl==img}">    </body></html>
```
After formatting:
```html
<html>

    <head>

        <title>

            Title text

        </title>

        <meta name="author"
              content="Jeff Barczewski"/>

        <meta name="viewport"
              content="width=device-width, initial-scale=1.0"/>

        <link rel="icon"
              type="image/png"
              sizes="64x64"
              href="/assets/favicon-64.png"/>

    </head>

    <body>

        <img ng-src="{{img}}"
             class="phone"
             ng-repeat="img in phone.images"
             ng-class="{active:mainImageUrl==img}">
        
    </body>

</html>
```
More example in folders [test/unformatted/](../../tree/master/test/unformatted) and [test/formatted/](../../tree/master/test/formatted).

## Using in browser
XMLDOCFormatter can you use in browser for show unformatted text as formatted:
```javascript
var xmldocformatter = new XMLDOCFormatter();
xmldocformatter.format("<html>text for formatting<html>");
```
## Using in streams
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

##Using in nodejs
XMLDOCFormatter can you use in konsole with node.js:
```sh
node xmldocformatter.js source path/to/source.html output path/to/output.html;
```

## Options
- source, source file or directory for formatting.
- output, output path for formatted file or directory.
- streambuffer, buffer size for streamreader.

## Questions, Bugs, Feature requests
All this you can leave in the appropriate section [issues](../../issues). 
