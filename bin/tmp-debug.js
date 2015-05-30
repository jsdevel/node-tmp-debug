#!/usr/bin/env node

var cwd = process.cwd();
var dirArg = process.argv.slice(2)[0];
var exit = process.exit;
var fs = require('fs');
var path = require('path');
var resolve = path.resolve;
var dir = resolve(cwd, dirArg || '.');
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
          .replace(/(function(?:(?!\{)[\s\S])+\{)(?!tmpDebug)/gm, '$1tmpDebug.logArgs(arguments);\n');
      fs.writeFileSync(file, contents, {encoding: 'utf8'});
    });
  });
});
