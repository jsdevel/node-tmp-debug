'use strict';

var fs = require('fs');
var resolve = require('path').resolve;
var tmpdir = require('os').tmpdir();
var stackTrace = require('stack-trace');
var noop = function(){};

module.exports = function(filename) {
  if (typeof filename !== 'string') {
    throw new Error(filename + ' must be a string at ' +
        stackTrace.parse(new Error())[1].getFileName());
  }

  var logFile = fs.createWriteStream(resolve(tmpdir, filename),
      {flags: 'a+', encoding: 'utf8'});

  function log(msg) {
    logFile.write('\n' + msg + '\n', 'utf8', noop);
  }

  function logStackTrace() {
    log(stackTrace.get().slice(1).map(function(stack) {
            return '  ' + stack.getFileName() + ':' + stack.getLineNumber() + ',' +
                stack.getColumnNumber();
          })
          .join('\n'));
  }

  return {
    log: log,
    logStackTrace: logStackTrace
  };
};
