import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  bumpCsvExplorerVersion,
  bumpPatchVersion,
  bumpVersion
} from '../scripts/bump-csv-explorer-version.mjs';

async function writeVersionFixture(version) {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'csv-explorer-version-'));
  const versionPath = path.join(tempDir, 'csv-explorer-version.js');
  await writeFile(versionPath, `export const CSV_EXPLORER_VERSION = '${version}';\n`, 'utf8');
  return versionPath;
}

test('bumpVersion increments patch, minor, and major versions', () => {
  assert.equal(bumpVersion('1.2.3', 'patch'), '1.2.4');
  assert.equal(bumpVersion('1.2.3', 'minor'), '1.3.0');
  assert.equal(bumpVersion('1.2.3', 'major'), '2.0.0');
});

test('bumpCsvExplorerVersion rewrites a version module', async () => {
  const versionPath = await writeVersionFixture('1.2.3');

  const nextVersion = await bumpCsvExplorerVersion({ versionPath, bump: 'minor' });
  const versionModule = await readFile(versionPath, 'utf8');

  assert.equal(nextVersion, '1.3.0');
  assert.equal(versionModule, "export const CSV_EXPLORER_VERSION = '1.3.0';\n");
});

test('bumpPatchVersion is a patch-bump convenience helper', async () => {
  const versionPath = await writeVersionFixture('1.2.3');

  const nextVersion = await bumpPatchVersion({ versionPath });
  const versionModule = await readFile(versionPath, 'utf8');

  assert.equal(nextVersion, '1.2.4');
  assert.equal(versionModule, "export const CSV_EXPLORER_VERSION = '1.2.4';\n");
});

test('version bumping rejects invalid input', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'csv-explorer-version-'));
  const versionPath = path.join(tempDir, 'csv-explorer-version.js');
  await writeFile(versionPath, "export const CSV_EXPLORER_VERSION = 'soon';\n", 'utf8');

  assert.throws(() => bumpVersion('1.2.3', 'banana'), /Expected patch, minor, or major/);
  await assert.rejects(
    () => bumpCsvExplorerVersion({ versionPath, bump: 'patch' }),
    /Could not find CSV_EXPLORER_VERSION export/
  );
});
