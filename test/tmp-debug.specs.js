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

  after(function(done) {
    del([tmpdebugrc], done);
  });

  function getContents(file) {
    return fs.readFileSync('/tmp/' + file, 'utf8');
  }

  function assertLogFileHas(file, content, cb) {
    setTimeout(function() {
      var contents = getContents(file);
      contents.indexOf(content).should.not.equal(-1);
      cb();
    }, 500);
  }

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

    after(function(done) {
      del(['/tmp/' + FILE], {force: true}, done);
    });

    describe('log', function() {
      it('should log', function(done) {
        var expectedContent = 'asdfasdf';
        tmpDebug.log(expectedContent);
        assertLogFileHas(FILE, expectedContent, done);
      });
    });

    describe('logArgs', function() {
      it('should log annonymous functions', function(done) {
        tmpDebug.logArgs(arguments);
        assertLogFileHas(FILE, 'anonymous(function (err))', done);
      });

      it('should separate args by newlines', function(done) {
        function asdfasdf(a, b, c) {
          tmpDebug.logArgs(arguments);
          assertLogFileHas(FILE, 'asdfasdf(5,\n         3,\n         4)', done);
        }
        asdfasdf(5, 3, 4);
      });

      it('should handle no arguments', function(done) {
        tmpDebug.logArgs();
        assertLogFileHas(FILE, 'anonymous()', done);
      });

      it('should log paramNames when available', function(done) {
        function testing(a, b, c) {
          tmpDebug.logArgs(arguments, ['a', 'b', 'c']);
          assertLogFileHas(FILE, 'testing(a => 1,\n        b => 2,\n        c => 3)', done);
        }

        testing(1, 2);
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

    describe('when outputDepth is set', function() {
      var tmpDebug;

      beforeEach(function() {
        create({enabled: true, outputDepth: 1});
        tmpDebug = sut('tmpDebug-outputDepth.log');
      });

      it('should be limit output', function() {
        tmpDebug.logArgs([{asdf:{asdf:{asdf:5}}}]);
      });
    });

    describe('when it is enabled', function() {
      var tmpDebug;

      beforeEach(function() {
        create({enabled: true});
        tmpDebug = sut('tmpDebug-enabled.log');
      });

      it('should log', function() {
        tmpDebug.log('asdfasdf');
        tmpDebug.logStackTrace();
        tmpDebug.logArgs(arguments);
      });
    });

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
        create({
          enabled: true,
          filters: [
            {file: 'tmp-debug.specs.js'}
          ]
        });
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
        create({
          enabled: true,
          filters: [
            {functionName: 'null'},
            {file: 'tmp-debug.specs.js', functionName: 'ignored'},
            {file: 'tmp-debug.specs.js', functionName: 'null'}
          ]
        });
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
