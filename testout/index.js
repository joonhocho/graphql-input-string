'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _graphql = require('graphql');

var _mocha = require('mocha');

var _chai = require('chai');

var _lib = require('../lib');

var _lib2 = _interopRequireDefault(_lib);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getSchema = function getSchema(options) {
  return new _graphql.GraphQLSchema({
    query: new _graphql.GraphQLObjectType({
      name: 'Query',
      fields: {
        input: {
          type: _graphql.GraphQLString,
          args: {
            value: {
              type: (0, _lib2.default)(_extends({
                argName: 'value'
              }, options))
            }
          },
          resolve: function resolve(_, _ref) {
            var value = _ref.value;
            return value;
          }
        }
      }
    })
  });
};

var testEqual = function testEqual(schema, done, value, expected) {
  return (0, _graphql.graphql)(schema, '{ input(value: ' + JSON.stringify(value) + ') }').then(function (res) {
    (0, _chai.expect)(res.data.input).to.equal(expected);
  }).then(done, done);
};

var testError = function testError(schema, done, value, expected) {
  return (0, _graphql.graphql)(schema, '{ input(value: ' + JSON.stringify(value) + ') }').then(function (res) {
    (0, _chai.expect)(res.errors[0].message).to.match(expected);
  }).then(done, done);
};

(0, _mocha.describe)('GraphQLInputString', function () {
  (0, _mocha.it)('default', function (done) {
    var schema = getSchema({
      typeName: 'default'
    });

    var value = ' 921hluaocb1 au0[g2930,0.uh, ';
    var expected = value;

    testEqual(schema, done, value, expected);
  });

  (0, _mocha.it)('trim', function (done) {
    var schema = getSchema({
      typeName: 'trim',
      trim: true
    });

    var value = ' 921hluaocb1 au0[g2930,0.uh, ';
    var expected = value.trim();

    testEqual(schema, done, value, expected);
  });

  (0, _mocha.it)('trimLeft', function (done) {
    var schema = getSchema({
      typeName: 'trimLeft',
      trimLeft: true
    });

    var value = ' 921hluaocb1 au0[g2930,0.uh, ';
    var expected = value.trimLeft();

    testEqual(schema, done, value, expected);
  });

  (0, _mocha.it)('trimRight', function (done) {
    var schema = getSchema({
      typeName: 'trimRight',
      trimRight: true
    });

    var value = ' 921hluaocb1 au0[g2930,0.uh, ';
    var expected = value.trimRight();

    testEqual(schema, done, value, expected);
  });

  (0, _mocha.it)('empty bad', function (done) {
    var schema = getSchema({
      typeName: 'NonString'
    });

    var value = '';

    testError(schema, done, value, /empty/);
  });

  (0, _mocha.it)('empty ok', function (done) {
    var schema = getSchema({
      typeName: 'NonString',
      empty: true
    });

    var value = '';

    testEqual(schema, done, value, value);
  });

  (0, _mocha.it)('truncate', function (done) {
    var schema = getSchema({
      typeName: 'truncate',
      truncate: 10
    });

    var value = ' 921hluaocb1 au0[g2930,0.uh, ';
    var expected = value.substring(0, 10);

    testEqual(schema, done, value, expected);
  });

  (0, _mocha.it)('trim and truncate', function (done) {
    var schema = getSchema({
      typeName: 'truncate',
      trim: true,
      truncate: 10
    });

    var value = ' 921hluaocb1 au0[g2930,0.uh, ';
    var expected = value.trim().substring(0, 10);

    testEqual(schema, done, value, expected);
  });

  (0, _mocha.it)('transform', function (done) {
    var schema = getSchema({
      typeName: 'truncate',
      transform: function transform(s) {
        return s.replace(/[^\d]*/g, '');
      }
    });

    var value = ' 921hluaocb1 au0[g2930,0.uh, ';
    var expected = '9211029300';

    testEqual(schema, done, value, expected);
  });

  (0, _mocha.it)('non-string bad', function (done) {
    var schema = getSchema({
      typeName: 'NonString'
    });

    var value = 3;

    testError(schema, done, value, /type/);
  });

  (0, _mocha.it)('non-string ok', function (done) {
    var schema = getSchema({
      typeName: 'NonString'
    });

    var value = '3';

    testEqual(schema, done, value, value);
  });

  (0, _mocha.it)('min bad', function (done) {
    var schema = getSchema({
      typeName: 'min',
      min: 3
    });

    var value = 'ab';

    testError(schema, done, value, /minimum.*3/);
  });

  (0, _mocha.it)('min ok', function (done) {
    var schema = getSchema({
      typeName: 'min',
      min: 3
    });

    var value = 'abc';

    testEqual(schema, done, value, value);
  });

  (0, _mocha.it)('max bad', function (done) {
    var schema = getSchema({
      typeName: 'max',
      max: 5
    });

    var value = 'abcdef';

    testError(schema, done, value, /maximum.*5/);
  });

  (0, _mocha.it)('max ok', function (done) {
    var schema = getSchema({
      typeName: 'max',
      max: 5
    });

    var value = 'abcde';

    testEqual(schema, done, value, value);
  });

  (0, _mocha.it)('pattern bad', function (done) {
    var schema = getSchema({
      typeName: 'pattern',
      pattern: /^\w+$/
    });

    var value = ' a ';

    testError(schema, done, value, /pattern/);
  });

  (0, _mocha.it)('pattern ok', function (done) {
    var schema = getSchema({
      typeName: 'pattern',
      pattern: /^\w+$/
    });

    var value = 'abc';

    testEqual(schema, done, value, value);
  });

  (0, _mocha.it)('test bad', function (done) {
    var schema = getSchema({
      typeName: 'test',
      test: function test(x) {
        return x.length < 3;
      }
    });

    var value = 'abc';

    testError(schema, done, value, /invalid/);
  });

  (0, _mocha.it)('test ok', function (done) {
    var schema = getSchema({
      typeName: 'test',
      test: function test(x) {
        return x.length < 3;
      }
    });

    var value = 'ab';

    testEqual(schema, done, value, value);
  });
});