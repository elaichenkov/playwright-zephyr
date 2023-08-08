import type { ZephyrTestCycle, ZephyrOptions } from './convert-status';
import type { PathLike } from 'fs';
import type { AxiosError } from 'axios';

import axios from 'axios';
import { getBorderCharacters, table } from 'table';
import { inspect } from 'util';
import { createReadStream } from 'fs';
import { bold, green, blue, gray } from 'picocolors';
import FormData from 'form-data';
import { validateOptions } from './validate-options';
import { constants } from 'node:crypto';
import { Agent } from 'node:https';

function isAxiosError(error: any): error is AxiosError {
  return error.isAxiosError === true;
}

export class ZephyrService {
  private readonly authorizationToken: string;
  private readonly projectKey: string;
  private readonly testCycle: ZephyrTestCycle | undefined;
  private readonly url = 'https://api.zephyrscale.smartbear.com/v2';
  private readonly defaultRunName = `Automated Playwright run - [${new Date().toUTCString()}]`;

  constructor(options: ZephyrOptions) {
    validateOptions(options);

    this.projectKey = options.projectKey;
    this.authorizationToken = options.authorizationToken!;
    this.testCycle = options.testCycle;
  }

  async createRun(testResults: PathLike) {
    const url = `${this.url}/automations/executions/custom?projectKey=${this.projectKey}&autoCreateTestCases=false`;
    const data = new FormData();
    const testCycleDefault = {
      name: this.defaultRunName,
      ...this.testCycle,
    };

    data.append('file', createReadStream(testResults));
    data.append('testCycle', JSON.stringify(testCycleDefault), { contentType: 'application/json' });

    try {
      const response = await axios({
        url,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.authorizationToken}`,
          ...data.getHeaders(),
        },
        // Warning: The request will fail with GlobalProtect VPN without setting this secure options ¯\_(ツ)_/¯
        httpsAgent: new Agent({
          secureOptions: constants.SSL_OP_LEGACY_SERVER_CONNECT,
        }),
        data,
      });

      if (response.status !== 200) throw new Error(`${response.status} - Failed to create test cycle`);

      const {
        data: { testCycle },
      } = response;

      this.printReportDetails(testCycle);

      return response.data;
    } catch (error) {
      this.handleAxiosError(error);
    }
  }

  printReportDetails(testCycle: { key: string; url: string }): void {
    const tableData = [
      [bold(green(`✅ Test cycle ${testCycle.key} has been created`))],
      [bold(gray('👇 Check out the test result'))],
      [bold(blue(`🔗 ${testCycle.url}`))],
    ];

    const report = table(tableData, {
      border: getBorderCharacters('norc'),
      singleLine: true,
    });

    console.log(bold('\n📋 Zephyr Scale Report details:'));
    console.log(report);
  }

  handleAxiosError(error: unknown): void {
    if (isAxiosError(error)) {
      console.error(`Config: ${inspect(error.config)}`);

      if (error.response) {
        throw new Error(
          `\nStatus: ${error.response.status} \nHeaders: ${inspect(error.response.headers)} \nData: ${inspect(
            error.response.data,
          )}`,
        );
      } else if (error.request) {
        throw new Error(`The request was made but no response was received. \n Error: ${inspect(error.toJSON())}`);
      } else {
        throw new Error(
          `Something happened in setting up the request that triggered an Error\n : ${inspect(error.message)}`,
        );
      }
    }

    throw new Error(`\nUnknown error: ${error}`);
  }
}
