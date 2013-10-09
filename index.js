var fs = require('fs')
var util = require('util')
var stream = require('stream')
var watch = require('node-watch')

var Changeling = function(file) {
  if (!(this instanceof Changeling)) {
    return new Changeling(file)
  }
  stream.Readable.call(this)
  this.file = file 
  this.busy = false
}

util.inherits(Changeling, stream.Readable)

Changeling.prototype._read = function() {
  var thy = this

  if (thy.busy) {
    return
  }
 
  thy.busy = true

  var kill = function(reason) {
    thy.emit('error', new Error(
      thy.file + ' ' + reason
    ))
  }

  // Trust nobody.
  fs.exists(thy.file, function(exists) {
    if (!exists) {
      kill('does not exist')
      return
    }

    // Output file
    fs.createReadStream(thy.file)
      .on('data', function(buffer) {
        thy.push(buffer)
      }) 
   
    // Watch it for changes
    watch(thy.file, function() {
      fs.stat(thy.file, update) 
    })
  })

  var deleted = null 
  var lmtime = null
  var update = function(error, stat) {
    // Give it a second before announcing
    // a deletion. Sometimes the file is in
    // the middle of saving.
    if (error) {
      return deleted = setTimeout(
        kill, 1, 'has been deleted'
      )
    }
   
    clearTimeout(deleted)
  
    if (!stat.isFile()) {
      return kill('not a file')
    }

    // Sometimes watch fires a multiple times,
    // so check that the file has actually
    // changed before making an announcement.
    var mtime = stat.mtime.getTime()
    if (mtime === lmtime) {
      return
    }

    lmtime = mtime
  
    var stream = fs.createReadStream(thy.file)
    stream.on('data', function(buffer) {
      thy.push(buffer)
    })
    stream.on('error', function(error) {
      kill(error.message)
    })
  }
}

module.exports = Changeling
