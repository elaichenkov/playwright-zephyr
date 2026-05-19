import type { ZephyrOptions, ZephyrStatus, ZephyrTestResult, ZephyrTestAttachment } from '../types/zephyr.types';
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
  private testAttachments: ZephyrTestAttachment[] = [];
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
    const hasProjectKeyTag = test.tags.some(tag => tag.includes(this.projectKey));
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

      this.checkAttachments(test, testCaseKey);
    } else if (hasProjectKeyTag) {
      const projectKeyTags = test.tags.filter(tag => tag.includes(this.projectKey));
      for (const tag of projectKeyTags) {
        const [, projectName] = test.titlePath();
        const testCaseKey = tag.replace(/^@/, '');
        const status = convertPwStatusToZephyr(result.status);
        this.testResults.push({
          testCaseKey,
          status,
          environment: this.environment ?? projectName ?? 'Playwright',
          executionDate: new Date().toISOString(),
        });

        this.checkAttachments(test, testCaseKey);
      }
    }
    
  }

  async onEnd() {
    if (this.testResults.length > 0) {
      const testrunKey = await this.zephyrService.createRun(this.testResults);
      await this.zephyrService.uploadAttachments(this.testAttachments, testrunKey);
    } else {
      console.log(`There are no tests with such ${this.testCaseKeyPattern} key pattern`);
    }
  }

  checkAttachments(test: TestCase, testCaseKey: string) {
    const screenshot = test.results[0]?.attachments.find(att => att.name === 'screenshot');
    if (screenshot) {
      this.testAttachments.push({
        testCaseKey,
        attachment: screenshot?.path as string,
      });
    }
  }
}

export default ZephyrReporter;
