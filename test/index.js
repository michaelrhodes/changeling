var run = require('tape').test
var fs = require('fs')
var changeling = require('../')

var letter = null
var path = __dirname + '/letter.txt'
var text = [
 'To Whom it May Concern,',
  '\n',
  'I would like to tell you about a ' +
  'little program called changeling…'
]

// Add the first line to the letter and
// start listening for changes.
fs.writeFileSync(path, text[0])
letter = changeling(path)

run('announce update', function(test) {
  letter.once('data', function(content) {
    test.equal(
      content.toString(), text.join(''),
      'should have updated'
    )
    test.end()
  })

  // Add the remaining text to the letter.
  fs.appendFile(path, text.slice(1).join(''))
})

run('announce deletion', function(test) {
  letter.once('error', function(error) {
    test.assert(
      /has been deleted/.test(error.message),
      'should mention deletion'
    )
    test.end()
    process.exit(0)
  })

  // Delete letter.
  setTimeout(function() {
    fs.unlink(path)
  }, 500)
})
