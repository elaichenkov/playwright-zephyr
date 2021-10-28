import { test, expect } from '@playwright/test';

test('[C71] another test', async ({ page, browserName }) => {
  test.skip(browserName === 'webkit');

  await page.goto('https://playwright.dev/');
  const title = page.locator('.navbar__inner .navbar__title');

  if (browserName === 'firefox') {
    await expect(title).toHaveText('Playright');
  }
  await expect(title).toHaveText('Playwright');
});
