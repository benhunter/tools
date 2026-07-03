import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const versionExportPattern = /export\s+const\s+CSV_EXPLORER_VERSION\s*=\s*(['"])(\d+)\.(\d+)\.(\d+)\1\s*;?/;

export function bumpVersion(version, bump = 'patch') {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!match) throw new Error(`Invalid CSV Explorer version "${version}". Expected x.y.z.`);

  const major = Number(match[1]);
  const minor = Number(match[2]);
  const patch = Number(match[3]);

  if (bump === 'patch') return `${major}.${minor}.${patch + 1}`;
  if (bump === 'minor') return `${major}.${minor + 1}.0`;
  if (bump === 'major') return `${major + 1}.0.0`;

  throw new Error(`Invalid CSV Explorer version bump "${bump}". Expected patch, minor, or major.`);
}

export function readVersionFromModule(moduleText) {
  const match = versionExportPattern.exec(moduleText);
  if (!match) {
    throw new Error('Could not find CSV_EXPLORER_VERSION export in version module.');
  }
  return `${match[2]}.${match[3]}.${match[4]}`;
}

export async function bumpCsvExplorerVersion({
  versionPath = path.join(repoRoot, 'csv-explorer-version.js'),
  bump = 'patch'
} = {}) {
  const moduleText = await readFile(versionPath, 'utf8');
  const currentVersion = readVersionFromModule(moduleText);
  const nextVersion = bumpVersion(currentVersion, bump);
  const nextModuleText = moduleText.replace(
    versionExportPattern,
    `export const CSV_EXPLORER_VERSION = '${nextVersion}';`
  );

  await writeFile(versionPath, nextModuleText, 'utf8');
  return nextVersion;
}

export function bumpVersionString(version, bump = 'patch') {
  return bumpVersion(version, bump);
}

export async function bumpPatchVersion(options = {}) {
  return bumpCsvExplorerVersion({ ...options, bump: 'patch' });
}

export async function bumpMinorVersion(options = {}) {
  return bumpCsvExplorerVersion({ ...options, bump: 'minor' });
}

export async function bumpMajorVersion(options = {}) {
  return bumpCsvExplorerVersion({ ...options, bump: 'major' });
}
