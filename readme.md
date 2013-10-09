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

changeling('/path/to/file')
  .on('error', function(error) {
    // An error will be thrown if
    // the watched file gets deleted.
  })
  .pipe(process.stdout)
```

### License
[MIT](http://opensource.org/licenses/MIT)
