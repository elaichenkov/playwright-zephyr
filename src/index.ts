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
  environment: string | undefined;

  constructor(options: ZephyrOptions) {
    this.options = options;
  }

  async onBegin() {
    this.projectKey = this.options.projectKey;
    this.environment = this.options.environment;

    this.zephyrService = new ZephyrService(this.options);
  }

  onTestEnd(test: TestCase, result: TestResult) {
    let testCaseIds: string[] | undefined;
    if (test.title.match(this.testCaseKeyPattern) && test.title.match(this.testCaseKeyPattern)!.length > 1) {
      const [, testCaseId] = test.title.match(this.testCaseKeyPattern)!;
      if(testCaseId) testCaseIds = [testCaseId];
    } else if(test.annotations.some(annotation => annotation.type === 'zephyrTestId')){
      testCaseIds = test.annotations
        .filter(annotation => annotation.type === 'zephyrTestId')
        .map(annotation => annotation.description || '');  
    }

    if(testCaseIds) {
      for (const testCaseId of testCaseIds) {
        const [, projectName] = test.titlePath();
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
