'use strict';

describe('canLog', function() {
  var canLog = require('../lib/can-log');
  var sinon = require('sinon');

  [
    [
      'scenarios where we should log',
      true,
      [
        [ 'no filter is defined',
          [{file:     null, functionName:     null, lien: null, column: null}],
           {file: 'asdfas', functionName: 'ffffff', line: '50', column: '30'}],
        [ 'file does not match',
          [{file:    'zzz', functionName:     null, line: null, column: null}],
           {file: 'asdfas', functionName: 'ffffff', line: '50', column: '30'}],
        [ 'file matches, functionName does not match',
          [{file:    'fas', functionName:     'zz', line: null, column: null}],
           {file: 'asdfas', functionName: 'ffffff', line: '50', column: '30'}],
        [ 'file and functionName match, line does not match',
          [{file:    'fas', functionName:     'ff', line:   20, column: null}],
           {file: 'asdfas', functionName: 'ffffff', line: '50', column: '30'}],
        [ 'file, functionName, and line match, column does not match',
          [{file:    'fas', functionName:     'ff', line: '50', column:   20}],
           {file: 'asdfas', functionName: 'ffffff', line: '50', column: '30'}],
        [ 'file matches, line does not match',
          [{file:    'fas', functionName:     null, line:   40, column: null}],
           {file: 'asdfas', functionName: 'ffffff', line: '50', column: '30'}],
        [ 'file matches, column does not match',
          [{file:    'fas', functionName:     null, line: null, column:   10}],
           {file: 'asdfas', functionName: 'ffffff', line: '50', column: '30'}],
        [ 'column does not match',
          [{file:    null,  functionName:     null, line: null, column:   10}],
           {file: 'asdfas', functionName: 'ffffff', line: '50', column: '30'}],
        ],
      ],

    [
      'scenarios where we shoud not log',
      false,
      [
        [ 'file matches',
          [{file:    'fas', functionName:     null, line: null, column: null}],
           {file: 'asdfas', functionName: 'ffffff', line: '50', column: '30'}],
        [ 'functionName matches',
          [{file:     null, functionName:    'fff', line: null, column: null}],
           {file: 'asdfas', functionName: 'ffffff', line: '50', column: '30'}],
        [ 'line matches',
          [{file:     null, functionName:     null, line:   50, column: null}],
           {file: 'asdfas', functionName: 'ffffff', line: '50', column: '30'}],
        [ 'column matches',
          [{file:     null, functionName:     null, line: null, column:   30}],
           {file: 'asdfas', functionName: 'ffffff', line: '50', column: '30'}],
        [ 'file and functionName match',
          [{file:    'fas', functionName:     'ff', line: null, column: null}],
           {file: 'asdfas', functionName: 'ffffff', line: '50', column: '30'}],
        [ 'file, functionName, and line match',
          [{file:    'fas', functionName:     'ff', line:  50,  column: null}],
           {file: 'asdfas', functionName: 'ffffff', line: '50', column: '30'}],
        [ 'file, functionName, line and column match',
          [{file:    'fas', functionName:     'ff', line:  50,  column: '30'}],
           {file: 'asdfas', functionName: 'ffffff', line: '50', column: '30'}],
        [ 'only column is defined and matches',
          [{file:     null, functionName:     null, line: null, column:   30}],
           {file: 'asdfas', functionName: 'ffffff', line: '50', column: '30'}],
        ],
    ]
  ].forEach(function(scenario) {
    var description = scenario[0];
    var expectedOutput = scenario[1];
    var tests = scenario[2];

    describe(description, function() {
      tests.forEach(function(test) {
        var description = test[0];
        var filters = test[1];
        var stackItem = test[2];
        var config;
        var stack;

        describe('when ' + description, function() {
          beforeEach(function() {
            config = {
              enabled: null,
              filters: filters
            };
            stack = [null, {
              getFileName: function() {return stackItem.file;},
              getFunctionName: function() {return stackItem.functionName;},
              getLineNumber: function() {return stackItem.line;},
              getColumnNumber: function() {return stackItem.column;}
            }];
          });

          it('should return ' + expectedOutput, function() {
            canLog(config, stack).should.be[expectedOutput];
          });
        });
      });
    });
  });
});
