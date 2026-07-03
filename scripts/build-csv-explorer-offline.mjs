import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { bumpCsvExplorerVersion } from './bump-csv-explorer-version.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const importCorePattern = /import\s*\{[\s\S]*?\}\s*from\s*['"]\.\/csv-explorer-core\.js['"];\s*/;
const importVersionPattern = /import\s*\{[\s\S]*?\}\s*from\s*['"]\.\/csv-explorer-version\.js['"];\s*/;

export async function buildCsvExplorerOffline({
  htmlPath = path.join(repoRoot, 'csv-explorer.html'),
  corePath = path.join(repoRoot, 'csv-explorer-core.js'),
  versionPath = path.join(repoRoot, 'csv-explorer-version.js'),
  outputPath = path.join(repoRoot, 'offline', 'csv-explorer.html'),
  bump = null
} = {}) {
  if (bump) await bumpCsvExplorerVersion({ versionPath, bump });

  const [html, coreModule, versionModule] = await Promise.all([
    readFile(htmlPath, 'utf8'),
    readFile(corePath, 'utf8'),
    readFile(versionPath, 'utf8')
  ]);

  if (!importCorePattern.test(html)) {
    throw new Error(`Could not find csv-explorer-core.js import in ${htmlPath}`);
  }

  if (!importVersionPattern.test(html)) {
    throw new Error(`Could not find csv-explorer-version.js import in ${htmlPath}`);
  }

  const inlineCore = coreModule.replace(/^export\s+function\s+/gm, 'function ');
  const inlineVersion = versionModule.replace(/^export\s+const\s+/gm, 'const ');
  const offlineHtml = html
    .replace(
      importCorePattern,
      `// Inlined from csv-explorer-core.js for file:// offline use.\n${inlineCore}\n`
    )
    .replace(
      importVersionPattern,
      `// Inlined from csv-explorer-version.js for file:// offline use.\n${inlineVersion}\n`
    );

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, offlineHtml, 'utf8');

  return outputPath;
}

function parseCliArgs(args) {
  let bump = null;
  let outputPath = null;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--bump') {
      bump = args[++i];
      if (!bump) throw new Error('Missing value for --bump. Expected patch, minor, or major.');
      continue;
    }

    if (arg.startsWith('--bump=')) {
      bump = arg.slice('--bump='.length);
      continue;
    }

    if (arg.startsWith('-')) throw new Error(`Unknown option ${arg}`);
    if (outputPath) throw new Error(`Unexpected extra argument ${arg}`);
    outputPath = path.resolve(process.cwd(), arg);
  }

  return { bump, outputPath };
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  const parsed = parseCliArgs(process.argv.slice(2));
  const outputPath = parsed.outputPath || path.join(repoRoot, 'offline', 'csv-explorer.html');

  const builtPath = await buildCsvExplorerOffline({ outputPath, bump: parsed.bump });
  console.log(`Wrote ${path.relative(process.cwd(), builtPath) || builtPath}`);
}
