import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  grep: /generated offline CSV Explorer opens from a file URL/
});
