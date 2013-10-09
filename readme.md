# changeling
changeling is a readable stream that watches a file for changes and then outputs its contents.

[![Build status](https://travis-ci.org/michaelrhodes/changeling.png?branch=master)](https://travis-ci.org/michaelrhodes/changeling)

## Install
```
npm install changeling
```

### Example
``` js
var changeling = require('changeling')
var file = changeling('/path/to/file')

file.pipe(process.stdout)

// Stop watching after 10 seconds
setTimeout(function() {
  file.close()
}, 10000)
```

#### Note
If a file is deleted while being watched, an error will be emitted from the relevant changeling object.

### License
[MIT](http://opensource.org/licenses/MIT)
