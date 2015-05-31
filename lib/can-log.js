'use strict';

var endsWith = require('ends-with');

module.exports = function canLog(config, stack) {
  var loggable = true;
  var stackItem = stack[1];
  var filters = config.filters;

  if (filters.length) {
    var file = stackItem.getFileName();
    var fnName = '' + stackItem.getFunctionName();
    var column = stackItem.getColumnNumber();
    var line = stackItem.getLineNumber();

    loggable = !filters.some(function(filter) {
      var filtered = false;

      if (filter.file) {
        filtered = endsWith(file, filter.file);

        if (!filtered) {
          return false;
        }
      }

      if (filter.functionName) {
        filtered = endsWith(fnName, filter.functionName);

        if (!filtered) {
          return false;
        }
      }

      if (filter.line) {
        filtered = +line === +filter.line;

        if (!filtered) {
          return false;
        }
      }

      if (filter.column) {
        filtered = +column === +filter.column;

        if (!filtered) {
          return false;
        }
      }

      return filtered;
    });
  }

  return loggable;
};
