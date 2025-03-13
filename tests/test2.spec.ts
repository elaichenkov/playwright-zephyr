import { test, expect } from '@playwright/test';

test('[T3] second test', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  const title = page.locator('.navbar__inner .navbar__title');
  await page.locator('.getStarted_Sjon', { hasText: 'Get started' }).click()
  await expect(page).toHaveURL('https://playwright.dev/docs/intro')
});
