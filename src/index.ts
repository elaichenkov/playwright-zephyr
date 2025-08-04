import type { ZephyrOptions, ZephyrStatus, ZephyrTestResult } from '../types/zephyr.types';
import type { Reporter, TestCase, TestResult, TestStatus } from '@playwright/test/reporter';

import { ZephyrService } from './zephyr.service';

function convertPwStatusToZephyr(status: TestStatus): ZephyrStatus {
  if (status === 'passed') return 'Pass';
  if (status === 'failed') return 'Fail';
  if (status === 'skipped') return 'Not Executed';
  if (status === 'timedOut') return 'Blocked';

  return 'Not Executed';
}

class ZephyrReporter implements Reporter {
  private zephyrService!: ZephyrService;
  private testResults: ZephyrTestResult[] = [];
  private projectKey!: string;
  private testCaseKeyPattern = /\[(.*?)\]/;
  private options: ZephyrOptions;
  private readonly ignoreFailedRetries: boolean;
  environment: string | undefined;

  constructor(options: ZephyrOptions) {
    this.options = options;
    this.ignoreFailedRetries = options.ignoreFailedRetries || false;
  }

  async onBegin() {
    this.projectKey = this.options.projectKey;
    this.environment = this.options.environment;

    this.zephyrService = new ZephyrService(this.options);
  }

  onTestEnd(test: TestCase, result: TestResult) {
    if (this.ignoreFailedRetries && test.retries !== result.retry && result.status !== 'passed') {
      return;
    }
    if (test.title.match(this.testCaseKeyPattern) && test.title.match(this.testCaseKeyPattern)!.length > 1) {
      const [, projectName] = test.titlePath();
      const [, testCaseId] = test.title.match(this.testCaseKeyPattern)!;
      const testCaseKey = `${this.projectKey}-${testCaseId}`;
      const status = convertPwStatusToZephyr(result.status);
      this.testResults.push({
        testCaseKey,
        status,
        environment: this.environment ?? projectName ?? 'Playwright',
        executionDate: new Date().toISOString(),
      });
    }
  }

  async onEnd() {
    if (this.testResults.length > 0) {
      await this.zephyrService.createRun(this.testResults);
    } else {
      console.log(`There are no tests with such ${this.testCaseKeyPattern} key pattern`);
    }
  }
}

export default ZephyrReporter;
