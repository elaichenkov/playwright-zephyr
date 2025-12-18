// playwright.config.ts
import { PlaywrightTestConfig } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const config: PlaywrightTestConfig = {
  reporter: [['list'], ['./src/cloud', { 
    runName: `testrun-${new Date().getTime()}`,
    authorizationToken: process.env.ZEPHYR_AUTHORIZATION_TOKEN,
    projectKey: 'QE'
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