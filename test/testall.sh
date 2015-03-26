
node src/nodejs/xmldocformatter.js \
 --source test/unformatted/nodejsstreamspage.html \
 --output test/formatted/nodejsstreamspage.html \
 --streambuffer 4096;
node src/nodejs/xmldocformatter.js \
 --source test/unformatted/news_rss.xml \
 --output test/formatted/news_rss.xml \
 --streambuffer 4096;
