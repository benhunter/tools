import assert from 'node:assert/strict';
import test from 'node:test';
import { parseCsv, applyColumnFilters, rowsToJson } from '../csv-explorer-core.js';

test('CSV special-property headers remain own data properties through filtering and export', () => {
  const headers = ['__proto__', 'constructor', 'toString', 'hasOwnProperty'];
  const { rows } = parseCsv(`${headers.join(',')}\nkeep,ctor,text,own\nskip,other,other,other`, ',');
  assert.equal(Object.getPrototypeOf(rows[0]), Object.prototype);
  for (const header of headers) assert.ok(Object.hasOwn(rows[0], header));
  assert.equal(rows[0].__proto__, 'keep');
  const filters = Object.fromEntries([['__proto__', [{ mode: 'include', value: 'keep' }]]]);
  assert.deepEqual(applyColumnFilters(rows, filters), [rows[0]]);
  assert.deepEqual(JSON.parse(rowsToJson(headers, rows)), rows);
});

test('JSON export retains an object-valued __proto__ without changing the output prototype', () => {
  const row = JSON.parse('{"__proto__":{"polluted":true},"constructor":"ctor"}');
  const output = JSON.parse(rowsToJson(['__proto__', 'constructor'], [row]))[0];
  assert.ok(Object.hasOwn(output, '__proto__'));
  assert.deepEqual(output.__proto__, { polluted: true });
  assert.equal(output.constructor, 'ctor');
  assert.equal(Object.getPrototypeOf(output), Object.prototype);
  assert.equal(output.polluted, undefined);
  assert.equal({}.polluted, undefined);
});

test('JSON export does not use inherited values for missing special-property columns', () => {
  const output = JSON.parse(rowsToJson(['__proto__', 'constructor', 'toString'], [{}]))[0];
  for (const key of ['__proto__', 'constructor', 'toString']) {
    assert.ok(Object.hasOwn(output, key));
    assert.equal(output[key], '');
  }
});
