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

    describe('logArgs', function() {
      it('should log annonymous functions with no args', function() {
        tmpDebug.logArgs(arguments);
      });

      it('should log annonymous functions with args', function(done, a, b) {
        tmpDebug.logArgs(arguments);
        done();
      });

      it('should separate args by newlines', function() {
        function asdfasdf(a, b, c) {
          tmpDebug.logArgs(arguments);
        }
        asdfasdf(5, 3, 4);
      });

      it('should stringify different argument types', function() {
        function asdfasdf() {
          tmpDebug.logArgs(arguments);
        }
        asdfasdf({asdf: 5}, [4,3,4,3,2], null, undefined, NaN, 1, 'asdf', new Date());
      });
    });

    describe('logStackTrace', function() {
      it('should log a stack trace', function() {
        tmpDebug.logStackTrace();
      });

      it('should be able to log with a prefix', function() {
        tmpDebug.logStackTrace('foo');
      });
    });
  });
});
