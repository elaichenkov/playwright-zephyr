// playwright.config.ts
import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  reporter: [['list'], ['playwright-zephyr/lib/src/cloud', { 
    host: process.env.JIRA_URL,
    runName: '',
    user: '',
    password: '',
    authorizationToken: process.env.ZEPHYR_API_TOKEN || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJjb250ZXh0Ijp7ImJhc2VVcmwiOiJodHRwczovL25hZ2hhdmlwb3VyLmF0bGFzc2lhbi5uZXQiLCJ1c2VyIjp7ImFjY291bnRJZCI6IjcwMTIxOjNmOGY2YjQyLTBjZmItNDFmMi1hYmZjLWJlZGZkMjBhM2M0NSIsInRva2VuSWQiOiI4MWMwNGM1Mi0wY2MwLTQxZTEtYWFhMy01ZGViZTNkZTIxN2UifX0sImlzcyI6ImNvbS5rYW5vYWgudGVzdC1tYW5hZ2VyIiwic3ViIjoiNzc3YThiZmEtYzIwMS0zZjI4LThlNjQtMjdmZjcyOWQ4Y2I5IiwiZXhwIjoxNzczMDgyNjMxLCJpYXQiOjE3NDE1NDY2MzF9.1eWWI46A2LIsI1F7J-JWGXqsXdMXFZTYNQhfcWBHV5Q',
    projectKey: process.env.ZEPHYR_PROJECT_KEY || 'IPWZ',
//    autoCreateTestCases: true,  // Allow automatic test case creation
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
    // {
    //   name: 'Safari',
    //   use: {
    //     browserName: 'webkit',
    //     viewport: { width: 1200, height: 750 },
    //   }
    // },
    // {
    //   name: 'Firefox',
    //   use: {
    //     browserName: 'firefox',
    //     viewport: { width: 800, height: 600 },
    //   }
    // },
  ],
};
export default config;