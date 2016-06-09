import {
  graphql,
  GraphQLSchema,
  GraphQLString,
  GraphQLObjectType,
} from 'graphql';
import {describe, it} from 'mocha';
import {expect} from 'chai';
import GraphQLInputString from '../lib';


const getSchema = (options) => new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      input: {
        type: GraphQLString,
        args: {
          value: {
            type: GraphQLInputString({
              argName: 'value',
              ...options,
            }),
          },
        },
        resolve: (_, {value}) => value,
      },
    },
  }),
});


const testEqual = (schema, done, value, expected) =>
  graphql(schema, `{ input(value: ${JSON.stringify(value)}) }`)
    .then((res) => {
      expect(res.data.input).to.equal(expected);
    })
    .then(done, done);


const testError = (schema, done, value, expected) =>
  graphql(schema, `{ input(value: ${JSON.stringify(value)}) }`)
    .then((res) => {
      expect(res.errors[0].message).to.match(expected);
    })
    .then(done, done);


describe('GraphQLInputString', () => {
  it('default', (done) => {
    const schema = getSchema({
      typeName: 'default',
    });

    const value = ' 921hluaocb1 au0[g2930,0.uh, ';
    const expected = value;

    testEqual(schema, done, value, expected);
  });

  it('trim', (done) => {
    const schema = getSchema({
      typeName: 'trim',
      trim: true,
    });

    const value = ' 921hluaocb1 au0[g2930,0.uh, ';
    const expected = value.trim();

    testEqual(schema, done, value, expected);
  });

  it('trimLeft', (done) => {
    const schema = getSchema({
      typeName: 'trimLeft',
      trimLeft: true,
    });

    const value = ' 921hluaocb1 au0[g2930,0.uh, ';
    const expected = value.trimLeft();

    testEqual(schema, done, value, expected);
  });

  it('trimRight', (done) => {
    const schema = getSchema({
      typeName: 'trimRight',
      trimRight: true,
    });

    const value = ' 921hluaocb1 au0[g2930,0.uh, ';
    const expected = value.trimRight();

    testEqual(schema, done, value, expected);
  });

  it('empty bad', (done) => {
    const schema = getSchema({
      typeName: 'NonString',
    });

    const value = '';

    testError(schema, done, value, /empty/);
  });

  it('empty ok', (done) => {
    const schema = getSchema({
      typeName: 'NonString',
      empty: true,
    });

    const value = '';

    testEqual(schema, done, value, value);
  });

  it('truncate', (done) => {
    const schema = getSchema({
      typeName: 'truncate',
      truncate: 10,
    });

    const value = ' 921hluaocb1 au0[g2930,0.uh, ';
    const expected = value.substring(0, 10);

    testEqual(schema, done, value, expected);
  });

  it('trim and truncate', (done) => {
    const schema = getSchema({
      typeName: 'truncate',
      trim: true,
      truncate: 10,
    });

    const value = ' 921hluaocb1 au0[g2930,0.uh, ';
    const expected = value.trim().substring(0, 10);

    testEqual(schema, done, value, expected);
  });

  it('transform', (done) => {
    const schema = getSchema({
      typeName: 'truncate',
      transform: (s) => s.replace(/[^\d]*/g, ''),
    });

    const value = ' 921hluaocb1 au0[g2930,0.uh, ';
    const expected = '9211029300';

    testEqual(schema, done, value, expected);
  });

  it('non-string bad', (done) => {
    const schema = getSchema({
      typeName: 'NonString',
    });

    const value = 3;

    testError(schema, done, value, /type/);
  });

  it('non-string ok', (done) => {
    const schema = getSchema({
      typeName: 'NonString',
    });

    const value = '3';

    testEqual(schema, done, value, value);
  });

  it('min bad', (done) => {
    const schema = getSchema({
      typeName: 'min',
      min: 3,
    });

    const value = 'ab';

    testError(schema, done, value, /minimum.*3/);
  });

  it('min ok', (done) => {
    const schema = getSchema({
      typeName: 'min',
      min: 3,
    });

    const value = 'abc';

    testEqual(schema, done, value, value);
  });

  it('max bad', (done) => {
    const schema = getSchema({
      typeName: 'max',
      max: 5,
    });

    const value = 'abcdef';

    testError(schema, done, value, /maximum.*5/);
  });

  it('max ok', (done) => {
    const schema = getSchema({
      typeName: 'max',
      max: 5,
    });

    const value = 'abcde';

    testEqual(schema, done, value, value);
  });

  it('pattern bad', (done) => {
    const schema = getSchema({
      typeName: 'pattern',
      pattern: /^\w+$/,
    });

    const value = ' a ';

    testError(schema, done, value, /pattern/);
  });

  it('pattern ok', (done) => {
    const schema = getSchema({
      typeName: 'pattern',
      pattern: /^\w+$/,
    });

    const value = 'abc';

    testEqual(schema, done, value, value);
  });

  it('pattern string ok', (done) => {
    const schema = getSchema({
      typeName: 'pattern',
      pattern: '^\\w+$',
    });

    const value = 'abc';

    testEqual(schema, done, value, value);
  });

  it('test bad', (done) => {
    const schema = getSchema({
      typeName: 'test',
      test: (x) => x.length < 3,
    });

    const value = 'abc';

    testError(schema, done, value, /invalid/);
  });

  it('test ok', (done) => {
    const schema = getSchema({
      typeName: 'test',
      test: (x) => x.length < 3,
    });

    const value = 'ab';

    testEqual(schema, done, value, value);
  });

  it('typeName', () => {
    expect(() => GraphQLInputString({
      argName: 'a',
    })).to.throw(/typeName/);
  });

  it('argName', () => {
    expect(() => GraphQLInputString({
      typeName: 'a',
    })).to.throw(/argName/);
  });

  it('serialize', (done) => {
    const schema = new GraphQLSchema({
      query: new GraphQLObjectType({
        name: 'Query',
        fields: {
          output: {
            type: GraphQLInputString({
              typeName: 'output',
              argName: 'output',
              trim: true,
            }),
            resolve: () => ' test ',
          },
        },
      }),
    });

    graphql(schema, '{ output }')
      .then((res) => {
        // trim is only applied to input
        expect(res.data.output).to.equal(' test ');
      })
      .then(done, done);
  });
});
