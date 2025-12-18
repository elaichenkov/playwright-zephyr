import { test, expect } from "@playwright/test";

test('annotated test', {
    annotation: [{ type: 'zephyrTestId', description: 'T1' }]
}, async ({page}) => {
    await page.goto('https://playwright.dev/');
    const title = page.locator('.navbar__inner .navbar__title');
    await expect(title).toHaveText('Playwright');
})

test('Can annotate tests with multiple Zephyr IDs', {
    annotation: [
        { type: 'zephyrTestId', description: 'T2' },
        { type: 'zephyrTestId', description: 'T3' }
    ]
}, async ({page}) => {
        await page.goto('https://playwright.dev/');
        const title = page.locator('.navbar__inner .navbar__title');
        await expect(title).toHaveText('Playwright');
    }
)

test.fail('Failed test with Zephyr ID', {
    annotation: [{ type: 'zephyrTestId', description: 'T1' }]
}, async ({page}) => {
    await page.goto('https://playwright.dev/');
    const title = page.locator('.navbar__inner .navbar__title');
    await expect(title).toHaveText('Playright'); // Intentional typo to cause failure
})