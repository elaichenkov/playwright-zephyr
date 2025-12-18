import type { Reporter, TestCase, TestResult } from '@playwright/test/reporter';
import type { ZephyrOptions, ZephyrTestResult } from './convert-status';

import { gray } from 'picocolors';

import { archiveReport } from './archive-report';
import { convertStatus } from './convert-status';
import { createJsonReport } from './create-report-file';
import { validateOptions } from './validate-options';
import { ZephyrService } from './zephyr-cloud.service';

export default class ZephyrReporter implements Reporter {
  private zephyrService!: ZephyrService;
  private testResults: ZephyrTestResult[] = [];
  private projectKey!: string;
  private readonly testCaseKeyPattern = /\[(.*?)\]/;
  private readonly ansiRegex = /\x1b\[[0-9;]*m/g;
  private options: ZephyrOptions;

  constructor(options: ZephyrOptions) {
    this.options = validateOptions(options);
  }

  async onBegin() {
    this.projectKey = this.options.projectKey;

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

        const testCaseKey = `${this.projectKey}-${testCaseId}`;
        const status = convertStatus(result.status);
        const comment = result.error
          ? `<b>❌ Error Message: </b> <br> <span style="color: rgb(226, 80, 65);">${this.stripAnsiCodes(result.error?.message)?.replaceAll(
              '\n',
              '<br>',
            )}</span> <br> <br> <b>🧱 Stack Trace:</b> <br> <span style="color: rgb(226, 80, 65);">${this.stripAnsiCodes(result.error?.stack)?.replaceAll(
              '\n',
              '<br>',
            )}</span>`
          : undefined;

        this.testResults.push({
          result: status,
          testCase: {
            key: testCaseKey,
            comment,
          },
        });
      }
    }
  }

  async onEnd() {
    if (this.testResults.length > 0) {
      const testResultsPath = 'test-results/zephyr';
      const zephyrReportName = `zephyr-report-${new Date().getTime()}.json`;
      createJsonReport(zephyrReportName, testResultsPath, this.testResults);

      const zephyrReportPath = archiveReport(zephyrReportName, testResultsPath);

      await this.zephyrService.createRun(zephyrReportPath);
    } else {
      console.log(gray(`[zephyr reporter]: There's no Zephyr test case id in this spec file`));
    }
  }

  private stripAnsiCodes(str: string | undefined): string | undefined {
    return str?.replaceAll(this.ansiRegex, '');
  }

}
