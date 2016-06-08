import {GraphQLScalarType} from 'graphql';
import {GraphQLError} from 'graphql/error';
import {Kind} from 'graphql/language';

const coerceString = (value) => value;

export default ({
  typeName,
  argName,
  trim,
  trimLeft,
  trimRight,
  truncate,
  transform,
  empty,
  min,
  max,
  pattern,
}) => {
  if (!typeName) {
    throw new Error('"typeName" is required');
  }

  if (!argName) {
    throw new Error('"argName" is required');
  }

  if (typeof pattern === 'string') {
    pattern = new RegExp(pattern);
  }

  const error = (value, ast, message) => {
    throw new GraphQLError(`Argument "${argName}" has invalid value ${JSON.stringify(value)}. ${message}.`, [ast]);
  };

  return new GraphQLScalarType({
    name: typeName,
    serialize: coerceString,
    parseValue: coerceString,
    parseLiteral(ast) {
      let {kind, value} = ast;
      if (kind !== Kind.STRING) {
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
        error(value, ast, `Expected minimum length "${min}"`);
      }

      if (max != null && value.length > max){
        error(value, ast, `Expected maximum length "${max}"`);
      }

      if (pattern != null && !pattern.test(value)) {
        error(value, ast, 'Unexpected pattern');
      }

      return value;
    },
  });
};
