// playwright.config.ts
import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  reporter: [['list'], ['./src/zephyr.reporter.ts', { 
    host: '',
    runName: '',
    user: '',
    password: '',
    authorizationToken: '',
    projectKey: ''
  }]],
  use: {
      screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'Chrome',
      use: {
        browserName: 'chromium',
        channel: 'chrome',
      },
    },
    {
      name: 'Safari',
      use: {
        browserName: 'webkit',
        viewport: { width: 1200, height: 750 },
      }
    },
    {
      name: 'Firefox',
      use: {
        browserName: 'firefox',
        viewport: { width: 800, height: 600 },
      }
    },
  ],
};
export default config;