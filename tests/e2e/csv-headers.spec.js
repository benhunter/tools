import { expect, test } from '@playwright/test';

async function upload(page, text) {
  await page.locator('#csvFile').setInputFiles({ name: 'headers.csv', mimeType: 'text/csv', buffer: Buffer.from(text) });
}

for (const url of ['/csv-explorer.html', '/offline/csv-explorer.html']) {
  test(`rename notices render hostile names as text in ${url}`, async ({ page }) => {
    await page.goto(url);
    const hostile = '<img src=x onerror=window.headerInjected=true>';
    await upload(page, `${hostile},${hostile},__proto__,__proto__\na,b,c,d`);
    const notice = page.locator('#headerRenames');
    await expect(notice.locator('li')).toHaveText([
      `Column 2: ${hostile} → ${hostile} (2) (duplicate)`,
      'Column 4: __proto__ → __proto__ (2) (duplicate)'
    ]);
    await expect(notice.locator('img, script, [onerror]')).toHaveCount(0);
    expect(await page.evaluate(() => window.headerInjected)).toBeUndefined();
    await expect(page.locator('#dataWrap tbody tr td')).toHaveText(['a', 'b', 'c', 'd']);
  });
  test(`header repairs are visible and usable in ${url}`, async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto(url);
    await upload(page, 'a,,a,a (2), x \n1,2,3,4,5\n6,7,8,9,10');
    await expect(page.locator('#tableStatus')).toHaveText('Rendered');
    const notice = page.locator('#headerRenames');
    await expect(notice).toBeVisible();
    await expect(notice.locator('li')).toHaveText([
      'Column 2: blank → Column 2 (blank)',
      'Column 3: a → a (3) (duplicate)'
    ]);
    await expect(page.locator('#dataWrap tbody tr').first().locator('td')).toHaveText(['1', '2', '3', '4', '5']);
    await page.locator('#filterColumn').selectOption('a (3)');
    await page.locator('#filterValue').fill('8');
    await page.locator('#addFilterBtn').click();
    await expect(page.locator('#dataWrap tbody tr')).toHaveCount(1);
    await expect(page.locator('#dataWrap tbody tr td')).toHaveText(['6', '7', '8', '9', '10']);
    await page.locator('#profileColumn').selectOption('Column 2');
    await expect(page.locator('#profileKpis')).toContainText('Column 2');
    await expect(notice).toBeVisible();
    await page.locator('#clearFiltersBtn').click();
    await page.locator('#copyCsvBtn').click();
    let exported;
    await expect.poll(async () => {
      exported = await page.evaluate(() => navigator.clipboard.readText());
      return exported;
    }).toBe('a,Column 2,a (3),a (2), x \n1,2,3,4,5\n6,7,8,9,10');
    await upload(page, exported);
    await expect(page.locator('#tableStatus')).toHaveText('Rendered');
    await expect(notice).toBeHidden();
    await expect(page.locator('#dataWrap tbody tr')).toHaveCount(2);
    await expect(page.locator('#filterColumn option').last()).toHaveAttribute('value', ' x ');
    await upload(page, ',,');
    await expect(notice.locator('li')).toHaveCount(3);
    await expect(page.locator('#colCount')).toHaveText('3');
    await upload(page, '');
    await expect(page.locator('#status')).toHaveText('Load failed');
    await expect(notice).toBeHidden();
  });
}
