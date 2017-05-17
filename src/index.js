import {GraphQLScalarType} from 'graphql';
import {GraphQLError} from 'graphql/error';
import {Kind} from 'graphql/language';


function coerceString(value) {
  if (typeof value === 'string') {
    return value;
  }
  return null;
}

// http://stackoverflow.com/a/7592235
const strToUpperCase = (str) => str.toUpperCase();

const wordRegex = /(?:^|\s)\S/g;

const sentenceRegex = /(?:^|\.\s)\S/g;

const newlineRegex = /[\r\n]+/g;

const newlineWithWSRegex = /\s*[\r\n]+\s*/g;

const whitespace = /\s+/g;

const collapseWS = (str) => str.replace(whitespace, ' ');

export default ({
  capitalize,
  collapseWhitespace,
  description,
  empty,
  error,
  lowerCase,
  max,
  min,
  name,
  parse,
  pattern,
  sanitize,
  singleline,
  test,
  trim,
  trimLeft,
  trimRight,
  truncate,
  upperCase,
  ...config,
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

  if (!description && !test) {
    // Autogenerate a description if no test is present
    description = 'A string';
    if (min && max) {
      description += ` between ${min} and ${max} characters`
    } else if (min) {
      description += ` of at least ${min} characters`
    } else if (max) {
      description += ` at most ${max} characters`
    }

    if (pattern) {
      if (description.length > 'A string'.length) {
        description += ' and';
      }
      description += ` that matches the pattern '${pattern}'`;
    }

    if (trim || trimLeft || trimRight) {
      if (trim) {
        description += ' that is trimmed.';
      } else {
        description += `that is trimmed to the ${trimLeft ? 'left' : 'right'}.`;
      }
    } else {
      description += '.';
    }
  }

  const parseValue = (value, ast) => {
    value = coerceString(value);
    if (value == null) {
      return null;
    }

    // Sanitization Phase

    if (value) {
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

      if (value) {
        if (singleline) {
          value = value.replace(newlineRegex, ' ');
        }

        if (collapseWhitespace) {
          if (singleline) {
            value = value.replace(whitespace, ' ');
          } else {
            value = value.split(newlineWithWSRegex).map(collapseWS).join('\n');
          }
        }

        if (truncate != null && value.length > truncate) {
          value = value.substring(0, truncate);
        }

        if (upperCase) {
          value = value.toUpperCase();
        } else if (lowerCase) {
          value = value.toLowerCase();
        }

        if (capitalize) {
          switch (capitalize) {
          case 'characters':
            value = value.toUpperCase();
            break;
          case 'words':
            value = value.replace(wordRegex, strToUpperCase);
            break;
          case 'sentences':
            value = value.replace(sentenceRegex, strToUpperCase);
            break;
          default:
            value = value[0].toUpperCase() + value.slice(1);
            break;
          }
        }
      }
    }

    if (sanitize) {
      value = sanitize(value);
      if (typeof value !== 'string') {
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
    description,
    parseLiteral(ast) {
      const {kind, value} = ast;
      if (kind === Kind.STRING) {
        return parseValue(value, ast);
      }
      return null;
    },
    ...config,
  });
};
