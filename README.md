# !!!Checkout new TypeScript rewrite version with some breaking changes
[joonhocho/graphql-scalar](https://github.com/joonhocho/graphql-scalar)

# graphql-input-string
[![Build Status](https://travis-ci.org/joonhocho/graphql-input-string.svg?branch=master)](https://travis-ci.org/joonhocho/graphql-input-string)
[![Coverage Status](https://coveralls.io/repos/github/joonhocho/graphql-input-string/badge.svg?branch=master)](https://coveralls.io/github/joonhocho/graphql-input-string?branch=master)
[![npm version](https://badge.fury.io/js/graphql-input-string.svg)](https://badge.fury.io/js/graphql-input-string)
[![Dependency Status](https://david-dm.org/joonhocho/graphql-input-string.svg)](https://david-dm.org/joonhocho/graphql-input-string)
[![License](http://img.shields.io/:license-mit-blue.svg)](http://doge.mit-license.org)


A configurable custom input string type for GraphQL with sanitization and validation.

Checkout [graphql-input-number](https://github.com/joonhocho/graphql-input-number) for validating number inputs.


### Install
```
npm install --save graphql-input-string
```


### Usage
```javascript
import GraphQLInputString from 'graphql-input-string';

const argType = GraphQLInputString({
  name: 'TrimmedString',
  trim: true,
});

new GraphQLObjectType({
  name: 'Query',
  fields: {
    input: {
      type: GraphQLString,
      args: {
        name: {
          type: argType,
        },
      },
      resolve: (_, {name}) => {

        'name' IS NOW A TRIMMED STRING

      };
    },
  },
});
```

### Options
```javascript
GraphQLInputString({
  // Type name.
  // [REQUIRED]
  name: string = null,

  // Whether to trim strings.
  trim: boolean = false,

  // Whether to trimLeft strings.
  trimLeft: boolean = false,

  // Whether to trimRight strings.
  trimRight: boolean = false,

  // Whether to disallow newline characters.
  singleline: boolean = false,

  // Whether to collapse whitespace characters.
  collapseWhitespace: boolean = false,

  // If specified, truncate strings to the specified length.
  truncate: number = null,

  // Whether to transform characters to uppercase.
  upperCase: boolean = false,

  // Whether to transform characters to lowercase.
  lowerCase: boolean = false,

  // If specified, capitalize string according to specified rule.
  // possible values: 'characters' | 'words' | 'sentences' | 'first'
  capitalize: string = null,

  // Sanitize function that is called at the end of sanitzation phase and before
  // validation phase.
  sanitize: ((string) => string) = null,

  // Whether to allow empty strings.
  empty: boolean = false,

  // Minimum length allowed (inclusive).
  min: number = null,

  // Maximum length allowed (inclusive).
  max: number = null,

  // Allowed pattern definition.
  pattern: (string | RegExp) = null,

  // Test function that is called at the end of validation phase.
  test: ((string) => boolean) = null,

  // Custom error handler.
  // May throw an error or return a value.
  // If a value is returned, it will become the final value.
  error: ErrorHandler = () => throw GraphQLError,

  // Parse function that is called after validation phase before returning a
  // value.
  // May throw an error or return a value.
  parse: ((string) => any) = null,

  // If you want to pass additional config to type constructor, simply add them here.
  // For example,
  description: string,
});


type ErrorInfo = {
  type: string,
  value: string,
  message: ?string,
  ast: ?Ast,
  ...args,
};


type ErrorHandler = (ErrorInfo) => any;
```


### License
```
The MIT License (MIT)

Copyright (c) 2016 Joon Ho Cho

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
