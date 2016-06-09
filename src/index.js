import {GraphQLScalarType} from 'graphql';
import {GraphQLError} from 'graphql/error';
import {Kind} from 'graphql/language';


function isString(value) {
  return typeof value === 'string';
}

function coerceString(value) {
  if (isString(value)) {
    return String(value);
  }
  return null;
}

export default ({
  argName,
  empty,
  max,
  min,
  parse,
  pattern,
  sanitize,
  test,
  trim,
  trimLeft,
  trimRight,
  truncate,
  typeName,
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
    throw new GraphQLError(`Argument "${argName}" has invalid value ${JSON.stringify(value)}.${message ? ` ${message}` : ''}.`, ast ? [ast] : []);
  };

  const parseValue = (value, ast) => {
    value = coerceString(value);
    if (value == null) {
      return null;
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

    if (truncate != null) {
      value = value.substring(0, truncate);
    }

    if (sanitize) {
      value = sanitize(value);
      if (!isString(value)) {
        return null;
      }
    }

    if (!empty && !value) {
      error(value, ast, 'Expected non-empty string');
    }

    if (min != null && value.length < min) {
      error(value, ast, `Expected minimum length "${min}"`);
    }

    if (max != null && value.length > max) {
      error(value, ast, `Expected maximum length "${max}"`);
    }

    if (pattern != null && !pattern.test(value)) {
      error(value, ast, 'Unexpected pattern');
    }

    if (test && !test(value)) {
      error(value, ast);
    }

    if (parse) {
      return parse(value);
    }

    return value;
  };

  return new GraphQLScalarType({
    name: typeName,
    serialize: coerceString,
    parseValue,
    parseLiteral(ast) {
      const {kind, value} = ast;
      if (kind === Kind.STRING) {
        return parseValue(value, ast);
      }
      return null;
    },
  });
};
