# tmp-debug [![NPM version][npm-image]][npm-url] [![Downloads][downloads-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coveralls Status][coveralls-image]][coveralls-url]
> Debug node scripts with the tmp directory.

## Motivation

While trying to understand how a daemon application worked, I wasn't able to debug
with `node-inspector` very easily.  The daemon also detached io streams, making
console log/error a non starter.  I ended up writing to a tmp file and decided to
publish a module around it.

## Example

```javascript
var tmpDebug = require('tmp-debug')('log.txt');

tmpDebug.logStackTrace(); // /tmp/log.txt now contains a stack trace.
tmpDebug.log('foo'); // /tmp/log.txt now has 'foo' appended.
```

##LICENSE
``````
The MIT License (MIT)

Copyright (c) 2015 jsdevel

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
``````

[downloads-image]: http://img.shields.io/npm/dm/tmp-debug.svg
[npm-url]: https://npmjs.org/package/tmp-debug
[npm-image]: http://img.shields.io/npm/v/tmp-debug.svg

[travis-url]: https://travis-ci.org/jsdevel/node-tmp-debug
[travis-image]: http://img.shields.io/travis/jsdevel/node-tmp-debug.svg

[coveralls-url]: https://coveralls.io/r/jsdevel/node-tmp-debug
[coveralls-image]: http://img.shields.io/coveralls/jsdevel/node-tmp-debug/master.svg
