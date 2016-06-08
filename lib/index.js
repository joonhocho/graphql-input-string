'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _graphql = require('graphql');

var _error = require('graphql/error');

var _language = require('graphql/language');

var coerceString = function coerceString(value) {
  return value;
};

exports.default = function (_ref) {
  var typeName = _ref.typeName;
  var argName = _ref.argName;
  var trim = _ref.trim;
  var trimLeft = _ref.trimLeft;
  var trimRight = _ref.trimRight;
  var truncate = _ref.truncate;
  var transform = _ref.transform;
  var empty = _ref.empty;
  var min = _ref.min;
  var max = _ref.max;
  var pattern = _ref.pattern;

  if (!typeName) {
    throw new Error('"typeName" is required');
  }

  if (!argName) {
    throw new Error('"argName" is required');
  }

  if (typeof pattern === 'string') {
    pattern = new RegExp(pattern);
  }

  var error = function error(value, ast, message) {
    throw new _error.GraphQLError('Argument "' + argName + '" has invalid value ' + JSON.stringify(value) + '. ' + message + '.', [ast]);
  };

  return new _graphql.GraphQLScalarType({
    name: typeName,
    serialize: coerceString,
    parseValue: coerceString,
    parseLiteral: function parseLiteral(ast) {
      var kind = ast.kind;
      var value = ast.value;

      if (kind !== _language.Kind.STRING) {
        error(value, ast, 'Expected type "String"');
      }

      if (trim) {
        value = value.trim();
      } else {
        if (trimLeft) {
          value = value.trimLeft();
        }
        if (trimRight) {
          value = value.trimRight();
        }
      }

      if (!empty && !value.length) {
        error(value, ast, 'Expected non-empty string');
      }

      if (truncate != null) {
        value = value.substring(0, truncate);
      }

      if (transform) {
        value = transform(value);
      }

      if (min != null && value.length < min) {
        error(value, ast, 'Expected minimum length "' + min + '"');
      }

      if (max != null && value.length > max) {
        error(value, ast, 'Expected maximum length "' + max + '"');
      }

      if (pattern != null && !pattern.test(value)) {
        error(value, ast, 'Unexpected pattern');
      }

      return value;
    }
  });
};