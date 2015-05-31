'use strict';

var canLog = require('./can-log');
var fs = require('fs');
var getConfig = require('./get-config');
var resolve = require('path').resolve;
var tmpdir = require('os').tmpdir();
var stackTrace = require('stack-trace');
var util = require('util');
var noop = function(){};
var space = '                                                           ';
var instanceCache = {};

module.exports = function(filename) {
  if (!instanceCache[filename]) {
    instanceCache[filename] = createTmpDebug(filename);
  }

  return instanceCache[filename];
};

function createTmpDebug(filename) {
  if (typeof filename !== 'string') {
    throw new Error(filename + ' must be a string at ' +
        stackTrace.parse(new Error())[1].getFileName());
  }

  var config = getConfig();

  var logFile = config.enabled ? fs.createWriteStream(resolve(tmpdir, filename),
      {flags: 'a+', encoding: 'utf8'}) : null;

  var log = config.enabled ? function log(msg) {
    var stack = stackTrace.get();

    if (!canLog(config, stack)) {
      return;
    }

    logFile.write('\n' + msg + '\n', 'utf8', noop);
  } : noop;

  var logStackTrace = config.enabled ? function logStackTrace(prefix) {
    var stack = stackTrace.get();

    if (!canLog(config, stack)) {
      return;
    }

    if (prefix === undefined) {
      prefix = '';
    } else {
      prefix += ' -->\n';
    }

    logFile.write('\n' + prefix + stack.slice(1).map(function(stack) {
            return '  ' + formatLineInfo(stack.getFileName(), stack.getLineNumber(),
                stack.getColumnNumber());
          })
          .join('\n') + '\n', 'utf8', noop);
  } : noop;

  var logArgs = config.enabled ? function logArgs(args) {
    var stack = stackTrace.get();

    if (!canLog(config, stack)) {
      return;
    }

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

    logFile.write('\n' + fnName + '(' + args.join(',\n' + space.slice(-(fnName.length + 1))) +
        ')\n  at ' + formatLineInfo(file, lineNumber, columnNumber) + '\n', 'utf8', noop);
  } : noop;

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

        return util.inspect(arg, {colors: true, depth: config.outputDepth});
    }
  }

  function formatLineInfo(file, line, column) {
    return file + ':' + line + ',' + column;
  }

  return {
    log: log,
    logArgs: logArgs,
    logStackTrace: logStackTrace,
  };
}
