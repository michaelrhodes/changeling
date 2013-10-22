var fs = require('fs')
var path = require('path')
var util = require('util')
var stream = require('stream')

var Changeling = function(file) {
  if (!(this instanceof Changeling)) {
    return new Changeling(file)
  }

  stream.Readable.call(this)

  this.file = file 
  this.watcher = null
  this.busy = false
}

util.inherits(Changeling, stream.Readable)

Changeling.prototype.close = function() {
  if (this.watcher) {
    this.watcher.close() 
  }
}

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
    var directory = path.resolve(thy.file, '..')
    watcher = fs.watch(directory, function(e, file) {
      if (file === path.basename(thy.file)) {
        fs.stat(thy.file, update)
      }
    })
  })

  var deleted = null 
  var lmtime = null
  var update = function(error, stat) {
    // Give it half a second before announcing
    // a deletion. Sometimes the file is in the
    // middle of saving.
    if (error) {
      return deleted = setTimeout(
        kill, 750, 'has been deleted'
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

    var hasContent = false
    fs.createReadStream(thy.file)
      .on('data', function(buffer) {
        hasContent = true
        thy.push(buffer)
      })
      .on('end', function() {
        // If the file is now empty, push
        // an invisible character so
        // updates can still happen.
        if (!hasContent) {
          thy.push('\u2060')
        }
      })
      .on('error', function(error) {
        kill(error.message)
      })
  }
}

module.exports = Changeling
