import { test, expect } from '@playwright/test';

/**
 * This test suite simulates a test that passes after a retry.
 * Make sure "ignoreFailedRetries" is set to true in the Playwright config
 * before running this test to properly validate reporter behavior.
 */
test.describe.configure({ retries: 2 });

test('[C70] should pass after a retry and be reported once', async ({ page }, testInfo) => {
  // Simulate a failure on first attempt
  if (testInfo.retry === 0) {
    expect(false).toBeTruthy();
  }

  await page.goto('https://playwright.dev');
  await expect(page).toHaveTitle(/Playwright/);
});
