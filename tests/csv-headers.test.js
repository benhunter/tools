import assert from 'node:assert/strict';
import test from 'node:test';
import { parseCsv, rowsToCsv, rowsToJson, rowsToMarkdownTable } from '../csv-explorer-core.js';

test('duplicate repairs reserve original names and preserve exact nonblank text', () => {
  const parsed = parseCsv(',Column 1,a,a,a (2), name ,name,Name,a\nx,y,1,2,3,4,5,6,7', ',');
  assert.deepEqual(parsed.headers, ['Column 1 (2)', 'Column 1', 'a', 'a (3)', 'a (2)', ' name ', 'name', 'Name', 'a (4)']);
  assert.deepEqual(Object.values(parsed.rows[0]), ['x', 'y', '1', '2', '3', '4', '5', '6', '7']);
  assert.deepEqual(parsed.renames, [
    { position: 1, original: '', resolved: 'Column 1 (2)', reason: 'blank' },
    { position: 4, original: 'a', resolved: 'a (3)', reason: 'duplicate' },
    { position: 9, original: 'a', resolved: 'a (4)', reason: 'duplicate' }
  ]);
});

test('terminal blank headers are retained with or without a final newline', () => {
  for (const ending of ['', '\n', '\r\n']) {
    assert.deepEqual(parseCsv(',,'.concat(ending), ',').headers, ['Column 1', 'Column 2', 'Column 3']);
    assert.deepEqual(parseCsv('a,'.concat(ending), ',').headers, ['a', 'Column 2']);
  }
  assert.deepEqual(parseCsv('', ',').headers, []);
  assert.deepEqual(parseCsv('\uFEFF', ',').headers, []);
});

test('repaired headers round trip and retain short rows and special properties in exports', () => {
  const parsed = parseCsv('\uFEFF,   ,__proto__,__proto__,constructor, x ,x\r\n1,2,3,4,5,6,7\r\nshort', ',');
  const expected = ['Column 1', 'Column 2', '__proto__', '__proto__ (2)', 'constructor', ' x ', 'x'];
  assert.deepEqual(parsed.headers, expected);
  assert.deepEqual(Object.values(parsed.rows[0]), ['1', '2', '3', '4', '5', '6', '7']);
  assert.deepEqual(Object.values(parsed.rows[1]), ['short', '', '', '', '', '', '']);
  assert.ok(Object.hasOwn(parsed.rows[0], '__proto__'));
  assert.equal(Object.getPrototypeOf(parsed.rows[0]), Object.prototype);
  const csv = rowsToCsv(parsed.headers, parsed.rows);
  const reimported = parseCsv(csv, ',');
  assert.deepEqual(reimported, { headers: expected, rows: parsed.rows, renames: [] });
  assert.deepEqual(JSON.parse(rowsToJson(parsed.headers, parsed.rows)), parsed.rows);
  assert.equal(rowsToMarkdownTable(parsed.headers, parsed.rows), '| Column 1 | Column 2 | __proto__ | __proto__ (2) | constructor |  x  | x |\n| --- | --- | --- | --- | --- | --- | --- |\n| 1 | 2 | 3 | 4 | 5 | 6 | 7 |\n| short |  |  |  |  |  |  |');
});

test('suffix-like original names are not reinterpreted', () => {
  assert.deepEqual(parseCsv('a (2),a (2),a (2) (2)', ',').headers, ['a (2)', 'a (2) (3)', 'a (2) (2)']);
  assert.deepEqual(parseCsv(',Column 1,Column 1 (2),Column 1,', ',').headers, ['Column 1 (3)', 'Column 1', 'Column 1 (2)', 'Column 1 (4)', 'Column 5']);
});

test('blank headers preserve positions and describe repairs', () => {
  const parsed = parseCsv('a,,c\n1,2,3', ',');
  assert.deepEqual(parsed.headers, ['a', 'Column 2', 'c']);
  assert.deepEqual(parsed.rows, [{ a: '1', 'Column 2': '2', c: '3' }]);
  assert.deepEqual(parsed.renames, [{ position: 2, original: '', resolved: 'Column 2', reason: 'blank' }]);
});
