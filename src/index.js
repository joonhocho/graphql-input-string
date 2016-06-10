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
  empty,
  error,
  max,
  min,
  name,
  parse,
  pattern,
  sanitize,
  test,
  trim,
  trimLeft,
  trimRight,
  truncate,
}) => {
  if (!name) {
    throw new Error('"name" is required');
  }

  if (typeof pattern === 'string') {
    pattern = new RegExp(pattern);
  }

  if (typeof error !== 'function') {
    error = ({value, ast, message}) => {
      const more = message ? ` ${message}.` : '';
      throw new GraphQLError(
        `Invalid value ${JSON.stringify(value)}.${more}`,
        ast ? [ast] : []
      );
    };
  }

  const parseValue = (value, ast) => {
    value = coerceString(value);
    if (value == null) {
      return null;
    }


    // Sanitization Phase

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

    if (truncate != null && value.length > truncate) {
      value = value.substring(0, truncate);
    }

    if (sanitize) {
      value = sanitize(value);
      if (!isString(value)) {
        return null;
      }
    }


    // Validation Phase

    if (!empty && !value) {
      return error({
        type: 'empty',
        value,
        message: 'Expected non-empty string',
        ast,
      });
    }

    if (min != null && value.length < min) {
      return error({
        type: 'min',
        value,
        min,
        message: `Expected minimum length "${min}"`,
        ast,
      });
    }

    if (max != null && value.length > max) {
      return error({
        type: 'max',
        value,
        max,
        message: `Expected maximum length "${max}"`,
        ast,
      });
    }

    if (pattern != null && !pattern.test(value)) {
      return error({
        type: 'pattern',
        value,
        pattern,
        message: 'Unexpected pattern',
        ast,
      });
    }

    if (test && !test(value)) {
      return error({
        type: 'test',
        value,
        test,
        ast,
      });
    }


    // Parse Phase

    if (parse) {
      return parse(value);
    }

    return value;
  };

  return new GraphQLScalarType({
    name,
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
