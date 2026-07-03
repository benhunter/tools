import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { CSV_EXPLORER_VERSION } from '../csv-explorer-version.js';
import { buildCsvExplorerOffline } from '../scripts/build-csv-explorer-offline.mjs';

async function writeVersionFixture(version) {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'csv-explorer-offline-version-'));
  const versionPath = path.join(tempDir, 'csv-explorer-version.js');
  await writeFile(versionPath, `export const CSV_EXPLORER_VERSION = '${version}';\n`, 'utf8');
  return versionPath;
}

test('buildCsvExplorerOffline generates a self-contained CSV Explorer page', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'csv-explorer-offline-'));
  const outputPath = path.join(tempDir, 'csv-explorer.html');

  const builtPath = await buildCsvExplorerOffline({ outputPath });
  const html = await readFile(builtPath, 'utf8');

  assert.equal(builtPath, outputPath);
  assert.match(html, /<h1>CSV Explorer/);
  assert.match(html, new RegExp(`CSV_EXPLORER_VERSION = '${CSV_EXPLORER_VERSION.replaceAll('.', '\\.')}'`));
  assert.match(html, /appVersionEl\.textContent = `v\$\{CSV_EXPLORER_VERSION\}`/);
  assert.doesNotMatch(html, /from\s+['"]\.\/csv-explorer-core\.js['"]/);
  assert.doesNotMatch(html, /from\s+['"]\.\/csv-explorer-version\.js['"]/);
  assert.match(html, /function parseCsv\(text, delim\)/);
  assert.match(html, /function summarizeColumn\(column, rows, nullSet = new Set\(\)\)/);
  assert.match(html, /Inlined from csv-explorer-core\.js for file:\/\/ offline use\./);
  assert.match(html, /Inlined from csv-explorer-version\.js for file:\/\/ offline use\./);
});

test('buildCsvExplorerOffline does not rewrite the version module by default', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'csv-explorer-offline-'));
  const outputPath = path.join(tempDir, 'csv-explorer.html');
  const versionPath = await writeVersionFixture('1.2.3');

  await buildCsvExplorerOffline({ outputPath, versionPath });

  const versionModule = await readFile(versionPath, 'utf8');
  const html = await readFile(outputPath, 'utf8');
  assert.equal(versionModule, "export const CSV_EXPLORER_VERSION = '1.2.3';\n");
  assert.match(html, /CSV_EXPLORER_VERSION = '1\.2\.3'/);
});

test('buildCsvExplorerOffline can bump the version before generating', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'csv-explorer-offline-'));
  const outputPath = path.join(tempDir, 'csv-explorer.html');
  const versionPath = await writeVersionFixture('1.2.3');

  await buildCsvExplorerOffline({ outputPath, versionPath, bump: 'patch' });

  const versionModule = await readFile(versionPath, 'utf8');
  const html = await readFile(outputPath, 'utf8');
  assert.equal(versionModule, "export const CSV_EXPLORER_VERSION = '1.2.4';\n");
  assert.match(html, /CSV_EXPLORER_VERSION = '1\.2\.4'/);
});

test('committed offline CSV Explorer build stays in sync with the generator', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'csv-explorer-offline-'));
  const outputPath = path.join(tempDir, 'csv-explorer.html');

  await buildCsvExplorerOffline({ outputPath });

  const [generatedHtml, committedHtml] = await Promise.all([
    readFile(outputPath, 'utf8'),
    readFile(path.join(process.cwd(), 'offline', 'csv-explorer.html'), 'utf8')
  ]);

  assert.equal(committedHtml, generatedHtml);
});
