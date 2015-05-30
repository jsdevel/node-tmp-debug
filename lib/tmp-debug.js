'use strict';

var fs = require('fs');
var resolve = require('path').resolve;
var tmpdir = require('os').tmpdir();
var stackTrace = require('stack-trace');
var noop = function(){};
var space = '                                                           ';

function stringifyArg(arg) {
  switch (typeof arg) {
    case 'string':
      return arg;
    case 'function':
      return arg.toString().replace(/(function[^)]+\))[\s\S]+/m, '$1');
    case 'undefined':
      return '' + arg;
    default:
      if (arg instanceof Date) {
        return 'Date(' + arg.toString() + ')';
      }
      return JSON.stringify(arg);
  }
}

function formatLineInfo(file, line, column) {
  return file + ':' + line + ',' + column;
}

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

  function logStackTrace(prefix) {
    if (prefix === undefined) {
      prefix = '';
    } else {
      prefix += ' -->\n';
    }

    log(prefix + stackTrace.get().slice(1).map(function(stack) {
            return '  ' + formatLineInfo(stack.getFileName(), stack.getLineNumber(),
                stack.getColumnNumber());
          })
          .join('\n'));
  }

  function logArgs(args) {
    var stack = stackTrace.get();
    var callerStack = stack[1];
    var file = callerStack.getFileName();
    var fnName = '' + callerStack.getFunctionName();
    var lineNumber = callerStack.getLineNumber();
    var columnNumber = callerStack.getColumnNumber();
    var fn = callerStack.getFunction() || noop;

    args = [].slice.call(args || []).map(stringifyArg);

    var params = fn.toString()
        .replace(/function[^(]*\(\s*([^)]*)\s*\)[\s\S]+/m, '$1')
        .split(/,\s*/);

    log(fnName + '(' + args.join(',\n' + space.slice(-(fnName.length + 1))) +
        ') at ' + formatLineInfo(file, lineNumber, columnNumber));
  }

  return {
    log: log,
    logArgs: logArgs,
    logStackTrace: logStackTrace,
  };
};
