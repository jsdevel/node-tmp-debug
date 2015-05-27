'use strict';

var should = require('should');

describe('tmp-debug', function(){
  var sut = require('../lib/tmp-debug');

  describe('instantiation', function() {
    it('should throw an error if file is null', function() {
      should(function() {
        sut();
      }).throw(/undefined must be a string at/);
    });
  });

  describe('instance', function() {
    var FILE = 'asdf.log';
    var tmpDebug;

    beforeEach(function() {
      tmpDebug = sut(FILE);
    });

    describe('log', function() {
      it('should log', function() {
        tmpDebug.log('asdfasdf');
      });
    });

    describe('logStackTrace', function() {
      it('should log a stack trace', function() {
        tmpDebug.logStackTrace();
      });
    });
  });
});
