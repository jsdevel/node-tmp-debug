#!/usr/bin/env node

var args = process.argv.slice(2);
var logArg = args.length > 1 ? args[1] : 'tmp-debug.log';
var dirArg = args[0];
var cwd = process.cwd();
var exit = process.exit;
var fs = require('fs');
var path = require('path');
var resolve = path.resolve;
var dir = resolve(cwd, dirArg || '.');
var logFileName;
var exitCodes = {
  COULD_NOT_STAT_DIR: 1,
  NON_DIR_ARG: 2,
  COULD_NOT_LIST_FILES: 3,
};

fs.stat(dir, function(err, stats) {
  if (err || !stats) {
    console.error('Could not stat ' + dir);
    console.error(err || stats);
    exit(exitCodes.COULD_NOT_STAT_DIR);
  }

  if (!stats.isDirectory() && dirArg) {
    console.error('This is not a directory: ' + dirArg);
    exit(exitCodes.NON_DIR_ARG);
  }

  fs.readdir(dir, function(err, entries) {
    if (err) {
      console.error('Could not list files in ' + dir);
      console.error(err);
      exit(exitCodes.COULD_NOT_LIST_FILES);
    }

    entries = entries.map(function(entry) {
      return resolve(dir, entry);
    });

    var files = entries.filter(function(entry) {
      return fs.statSync(entry).isFile() && /\.js$/i.test(entry);
    });

    if (!files || !files.length) {
      console.warn('No .js files found in ' + dir);
      exit();
    }

    files.forEach(function(file) {
      var contents = fs.readFileSync(file, {encoding: 'utf8'})
          .replace(/(function(?! __tmpDebug)(?:(?!\{)[\s\S])+\{)(?!__tmpDebug)/gm, '$1__tmpDebug().logArgs(arguments);\n');

      if (contents.indexOf('function __tmpDebug') === -1) {
        contents += [
          '',
          '',
          '//Added by tmp-debug.js',
          'var __tmpDebugModule;',
          'function __tmpDebug() {',
          '  if (!__tmpDebugModule) {',
          '    __tmpDebugModule = require(\'tmp-debug\')(\'' + logArg + '\');',
          '  }',
          '  return __tmpDebugModule;',
          '}',
          ''
        ].join('\n');
      }

      fs.writeFileSync(file, contents, {encoding: 'utf8'});
    });
  });
});