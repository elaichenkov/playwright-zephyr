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

  constructor(options: ZephyrOptions) {
    this.options = options;
  }

  async onBegin() {
    this.projectKey = this.options.projectKey;

    this.zephyrService = new ZephyrService(this.options);
  }

  onTestEnd(test: TestCase, result: TestResult) {
    if (test.title.match(this.testCaseKeyPattern) && test.title.match(this.testCaseKeyPattern)!.length > 1) {
      const [, projectName] = test.titlePath();
      const [, testCaseId] = test.title.match(this.testCaseKeyPattern)!;
      const testCaseKey = `${this.projectKey}-${testCaseId}`;
      const status = convertPwStatusToZephyr(result.status);
      // @ts-ignore
      const browserName = test._pool.registrations.get('browserName').fn;
      const capitalize = (word: string) => word && word[0]!.toUpperCase() + word.slice(1);

      this.testResults.push({
        testCaseKey,
        status,
        environment: projectName || capitalize(browserName),
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
