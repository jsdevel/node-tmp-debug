'use strict';

var del = require('del');
var fs = require('fs');
var path = require('path');
var should = require('should');

describe('tmp-debug', function(){
  var sut = require('../lib/tmp-debug');
  var tmpdebugrc = path.resolve(__dirname, '../.tmpdebugrc');

  beforeEach(function(done) {
    del([tmpdebugrc], done);
  });

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

      it('should handle no arguments', function() {
        tmpDebug.logArgs();
      });

      it('should stringify different argument types', function() {
        var circular = {};
        circular.circular = circular;

        function asdfasdf() {
          tmpDebug.logArgs(arguments);
        }
        asdfasdf(
          {asdf: 5},
          [4,3,4,3,2],
          null,
          undefined,
          NaN,
          1,
          'asdf',
          new Date(),
          circular
        );
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

  describe('when .tmpdebugrc is found', function() {
    function create(obj) {
      fs.writeFileSync(tmpdebugrc, JSON.stringify(obj), 'utf8');
    }

    describe('when it is disabled', function() {
      var tmpDebug;

      beforeEach(function() {
        create({enabled: false});
        tmpDebug = sut('tmpDebug-disabled.log');
      });

      it('should not log anything', function() {
        tmpDebug.log('asdfasdf');
        tmpDebug.logStackTrace();
        tmpDebug.logArgs(arguments);
      });
    });

    describe('ignoring files', function() {
      var tmpDebug;

      beforeEach(function() {
        create({enabled: true, ignore: {files: ['tmp-debug.specs.js']}});
        tmpDebug = sut('tmpDebug-files.log');
      });

      it('should not log anything', function() {
        tmpDebug.log('asdfasdf');
        tmpDebug.logStackTrace();
        tmpDebug.logArgs(arguments);
      });
    });

    describe('ignoring functions', function() {
      var tmpDebug;

      beforeEach(function() {
        create({enabled: true, ignore: {functions: ['ignored']}});
        tmpDebug = sut('tmpDebug-functions.log');
      });

      it('should not log anything', function() {
        function ignored() {
          tmpDebug.logStackTrace();
          tmpDebug.log('asdfasdf');
          tmpDebug.logArgs(arguments);
        }
        ignored();
      });
    });
  });
});
