import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const hostileFilename = '<img src=x onerror=window.filenameInjected=true>" autofocus onfocus="window.filenameInjected=true" & notes.txt';

test('File Vault treats stored filenames as text and preserves download/delete behavior', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/file-manager.html');
  await expect(page.locator('#fileList')).toContainText('No files stored yet.');
  await page.locator('#fileInput').setInputFiles({
    name: hostileFilename,
    mimeType: 'text/plain',
    buffer: Buffer.from('safe file contents')
  });
  await page.getByRole('button', { name: 'Save to Storage' }).click();
  await expect(page.locator('.file-name')).toHaveText(hostileFilename);

  // Exercise the persisted path too: untrusted filenames must stay inert on reload.
  await page.reload();
  await expect(page.locator('.file-name')).toHaveText(hostileFilename);
  await expect(page.locator('#fileList img, #fileList script, #fileList [onerror], #fileList [onfocus], #fileList [autofocus]')).toHaveCount(0);
  expect(await page.evaluate(() => window.filenameInjected)).toBeUndefined();
  const link = page.getByRole('link', { name: 'Download' });
  await expect(link).toHaveAttribute('download', hostileFilename);
  await expect(link).toHaveAttribute('href', /^blob:/);
  const downloadPromise = page.waitForEvent('download');
  await link.click();
  const download = await downloadPromise;
  expect(await readFile(await download.path(), 'utf8')).toBe('safe file contents');
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  await expect(page.locator('#fileList')).toContainText('No files stored yet.');
  expect(errors).toEqual([]);
});

for (const url of ['/csv-explorer.html', '/offline/csv-explorer.html']) {
  test(`special-property CSV headers can be filtered safely in ${url}`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(url);
    await page.locator('#csvFile').setInputFiles({
      name: 'special.csv',
      mimeType: 'text/csv',
      buffer: Buffer.from('__proto__,constructor,toString,hasOwnProperty\nkeep,keep,keep,keep\nskip,skip,skip,skip')
    });
    await expect(page.locator('#tableStatus')).toHaveText('Rendered');
    await expect(page.locator('#dataWrap tbody tr')).toHaveCount(2);
    for (const column of ['__proto__', 'constructor', 'toString', 'hasOwnProperty']) {
      await page.locator('#filterColumn').selectOption(column);
      await page.locator('#filterValue').fill('keep');
      await page.locator('#addFilterBtn').click();
      await expect(page.locator('#dataWrap tbody tr')).toHaveCount(1);
      await expect(page.locator('#dataWrap tbody')).toContainText('keep');
      await page.locator('#clearFiltersBtn').click();
      await expect(page.locator('#dataWrap tbody tr')).toHaveCount(2);
    }
    expect(errors).toEqual([]);
  });
}

test('JSON array rows retain __proto__ as data without inheriting attacker-controlled cells', async ({ page }) => {
  await page.goto('/json-explorer.html');
  await page.locator('#fileInput').setInputFiles({
    name: 'special.json',
    mimeType: 'application/json',
    buffer: Buffer.from('[{"__proto__":{"polluted":"inherited"},"constructor":"ctor"},{"polluted":"own"}]')
  });
  await expect(page.locator('#status')).toContainText('Loaded special.json');
  await page.getByRole('button', { name: 'Array Tables', exact: true }).click();
  const rows = page.locator('#tableContent tbody tr');
  await expect(rows).toHaveCount(2);
  await expect(rows.nth(0).locator('td')).toHaveText(['0', '{"polluted":"inherited"}', 'ctor', '']);
  await expect(rows.nth(1).locator('td')).toHaveText(['1', '', '', 'own']);
  expect(await page.evaluate(() => ({}).polluted)).toBeUndefined();
});
