'use strict';

var defaultConfig = {
  enabled: true,
  filters: []
};
var findup = require('findup-sync');
var fs = require('fs');

function coerceConfig(config) {
  config.filters = (config.filters || []).filter(function(filter) {
    return !!filter;
  });

  config.outputDepth = config.outputDepth || 3;
}

module.exports = function getConfig() {
  var tmpdebugrc = findup('.tmpdebugrc');
  var config = defaultConfig;
  if (tmpdebugrc) {
    config = JSON.parse(fs.readFileSync(tmpdebugrc, 'utf8'));
    coerceConfig(config);
  }
  return config;
};
