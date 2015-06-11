'use strict';

var chalk = new require('chalk').constructor({enabled: true});
var fs = require('fs');
var path = require('path');
var resolve = path.resolve;

module.exports = function() {
  var help = fs
      .readFileSync(resolve(__dirname, 'help.txt'), {encoding: 'utf8'})
      .replace(/^#\s+(.*)(\s*)$/gm, function(match, group1, ending) {
        return chalk.bold.underline(group1) + ending;
      })
      .replace(/^##\s+(.*)(\s*)$/gm, function(match, group1, ending) {
        return chalk.bold.underline(group1) + ending;
      })
      .replace(/^(\s*)\*(\s*)/mg, '$1' + String.fromCharCode(0x26aa) + '$2');

  console.log('\n' + help);
};
