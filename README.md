# XMLDOCFormatter
A JavaScript Framework for formatting XML, HTML, JSP, PHP documents.

## Sample
 Before formatting: 
```html
<html> <head> </head>
    <body>  </body> </html>
```
After formatting:
```html
<html>
    <head>
    </head>
    <body>
    </body>
</html>
```
More example in folders [test/unformatted/]() and [test/formatted/]().

##Using in browser
XMLDOCFormatter can you use in browser for show unformatted text as formatted:
```javascript
var xmldocformatter = new XMLDOCFormatter();
xmldocformatter.format("<html>text for fromatting<html>");
```

##Using in nodejs
XMLDOCFormatter can you use in konsole with node.js:
```sh
node xmldocformatter.js --source path/to/source.html --output path/to/output.html;
```

##Questions, Bugs, Feature requests
All this you can leave in the appropriate section [issues](). 