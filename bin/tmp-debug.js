#!/usr/bin/env node

var args = require('minimist')(process.argv.slice(2), {
  boolean: ['d', 'dry-run', 'h', 'help'],
  default: {
    'log-file': 'tmp-debug.log'
  },
  string: ['i', 'ignore']
});
var chalk = new (require('chalk').constructor)({enabled: true});
var cwd = process.cwd();
var exit = process.exit;
var fs = require('fs');
var getFnParams = require('get-fn-params');
var path = require('path');
var resolve = path.resolve;
var exitCodes = {
  NO_JS_FILES_FOUND: 5,
  NO_DIR_ARG: 2,
  UNKOWN: 4,
};

var dirs = args._.map(toAbsolute(cwd));
var logFile = args['log-file'];

var directoriesToProcess = [];
var files = [];

if (args.h || args.help) {
  help(0);
}

if (!dirs.length) {
  error('No directory was specified!');
  help(exitCodes.NO_DIR_ARG);
}

dirs.forEach(handleArgDir);

if (!files || !files.length) {
  error('No .js files found!');
  exit(exitCodes.NO_JS_FILES_FOUND);
}

if (args.d || args['dry-run']) {
  console.log(files);
  console.log(files.length + ' file[s] were found.');
  console.log('Dry run detected.');
  exit(0);
}

files.forEach(instrument);

function error(msg) {
  console.error('\n' + chalk.red(msg));
}

function handleArgDir(dir) {
  var dirStat = fs.statSync(dir);

  if (!dirStat.isDirectory()) {
    error(dir + ' was not a directory!\n\nYou must provide directories.');
    exit(1);
  }

  directoriesToProcess.push(fs.readdirSync(dir).map(toAbsolute(dir)));

  while (directoriesToProcess.length) {
    handleDirectory(directoriesToProcess.shift());
  }
}

function handleDirectory(directory) {
  directory.forEach(function(node) {
    var stat = fs.statSync(node);
    if (stat.isFile() && /\.js$/.test(node)) {
      files.push(node);
    }
  });
}

function help(code) {
  require('./help')();
  exit(code);
}

function instrument(file) {
  var contents = fs.readFileSync(file, {encoding: 'utf8'});

  contents = contents
    .replace(
        /(function\s*([a-z][a-z0-9$_]*)?\s*\([^)]*\)\s*\{)(?!__tmpDebug)/gim,
        function (match, fn) {
          return fn +
                 '__tmpDebug().logArgs(arguments, ' +
                 JSON.stringify(getFnParams(fn)) +
                 ');';
        });

  if (contents.indexOf('function __tmpDebug') === -1) {
    contents += [
      '',
      '',
      '//Added by tmp-debug.js',
      'var __tmpDebugModule;',
      'function __tmpDebug() {',
      '  if (!__tmpDebugModule) {',
      '    __tmpDebugModule = require(\'tmp-debug\')(\'' + logFile + '\');',
      '  }',
      '  return __tmpDebugModule;',
      '}',
      ''
    ].join('\n');
  }

  fs.writeFileSync(file, contents, {encoding: 'utf8'});
}

function toAbsolute(base) {
  return function(dir) {
    return resolve(base, dir);
  };
}
