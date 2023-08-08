# Zephyr reporter for Playwright

Publish Playwright test run on Zephyr

## Install

```sh
npm i -D playwright-zephyr
```

## Usage

Add **Server** reporter to your `playwright.config.ts` configuration file

```typescript
// playwright.config.ts
import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  reporter: [['playwright-zephyr', { 
    host: 'https://jira.your-company-domain.com/',
    authorizationToken: 'SVSdrtwgDSA312342--',
    projectKey: 'JARV'
  }]],
}
```

If you want to use **Cloud** reporter, you need to specify `cloud` option:

```typescript
// playwright.config.ts
import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  reporter: [
    ['playwright-zephyr/lib/src/cloud', {
      projectKey: 'JARV', // <-- Replace with your project key
      authorizationToken: process.env.ZEPHYR_AUTH_TOKEN, // <-- Replace with your authorization token
    }],
  ],
}
```

If your test cycle requires custom fields, you can specify them in `testCycle` option:

```typescript
// playwright.config.ts
import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
    reporter: [
    ['playwright-zephyr/lib/src/cloud', {
      projectKey: 'JARV', // <-- Replace with your project key
      authorizationToken: process.env.ZEPHYR_AUTH_TOKEN, // <-- Replace with your authorization token
      testCycle: {
          name: `Automated Playwright Run - ${new Date().toISOString()}`,
          customFields: {
            Browser: 'Google Chrome',
            Device: 'MacOS',
          },
        },
    }],
  ],
}
```

Read how to get Zephyr authorization token [here](https://tm4j-cloud.elevio.help/en/articles/164).

Also, your playwright tests should include unique ID inside square brackets `[J79]` of your Zephyr test case:

```typescript
//      ↓  Zephyr test case ID inside square brackets
test('[J79] basic test', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  const title = page.locator('.navbar__inner .navbar__title');
  await expect(title).toHaveText('Playwright');
});
```

Then run your tests with `npx playwright test` command and you'll see the result in console:

```sh
✅ Test cycle JARV-C2901 has been created
👇 Check out the test result
🔗 https://jira.your-company-domain.com/secure/Tests.jspa#/testPlayer/JARV-C2901
```

And you'll see the result in the Zephyr:

![alt text](./assets/zephyr-result.png)

## License

playwright-zephyr is [MIT licensed](./LICENSE).

## Author

Yevhen Laichenkov <elaichenkov@gmail.com>
