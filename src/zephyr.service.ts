import { ZephyrTestResult, ZephyrTestAttachment } from './../types/zephyr.types';
import axios, { Axios, AxiosError } from 'axios';
import { ZephyrOptions } from '../types/zephyr.types';
import { inspect } from 'util';
import { bold, green } from 'picocolors';
import { readFileSync } from 'fs';
import path from 'path';

function isAxiosError(error: any): error is AxiosError {
  return error.isAxiosError === true;
}

export class ZephyrService {
  private readonly host: string;
  private readonly url: string;
  private readonly user: string;
  private readonly password: string;
  private readonly authorizationToken: string;
  private readonly basicAuthToken: string;
  private readonly projectKey: string;
  private readonly axios: Axios;
  private readonly defaultRunName = `[${new Date().toUTCString()}] - Automated run`;
  private readonly testRunKey: string | undefined;

  constructor(options: ZephyrOptions) {
    if (!options.host) throw new Error('"host" option is missed. Please, provide it in the config');
    if (!options.projectKey) throw new Error('"projectKey" option is missed. Please, provide it in the config');
    if ((!options.user || !options.password) && !options.authorizationToken)
      throw new Error('"user" and/or "password" or "authorizationToken" options are missed. Please provide them in the config');

    this.host = options.host;
    this.url = `${this.host}/rest/atm/1.0`;
    this.user = options.user!;
    this.password = options.password!;
    this.basicAuthToken = Buffer.from(`${this.user}:${this.password}`).toString('base64');
    this.authorizationToken = options.authorizationToken ?? this.basicAuthToken;
    const authPrefix = options.authorizationToken ? 'Bearer' : 'Basic';
    this.projectKey = options.projectKey;
    this.testRunKey = options.testRunKey;

    this.axios = axios.create({
      baseURL: this.url,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${authPrefix} ${this.authorizationToken}`,
      },
      ...options,
    });
  }

  async createRun(items: ZephyrTestResult[], name = this.defaultRunName): Promise<string> {
    if (this.testRunKey) {
      return this.updateRun(items);
    }

    const URL = `${this.url}/testrun`;

    try {
      const response = await this.axios.post(URL, {
        name,
        projectKey: this.projectKey,
        items,
      });

      if (response.status !== 201) throw new Error(`${response.status} - Failed to create test cycle`);

      const {
        data: { key },
      } = response;

      console.log(`${bold(green(`✅ Test cycle ${key} has been created`))}`);
      console.log(`${bold(green('👇 Check out the test result'))}`);
      console.log(`🔗 ${this.host}/secure/Tests.jspa#/testPlayer/${key}`);

      return response.data.key;
    } catch (error) {
      if (isAxiosError(error)) {
        console.error(`Config: ${inspect(error.config)}`);

        if (error.response) {
          throw new Error(
            `\nStatus: ${error.response.status} \nHeaders: ${inspect(error.response.headers)} \nData: ${inspect(error.response.data)}`,
          );
        } else if (error.request) {
          throw new Error(`The request was made but no response was received. \n Error: ${inspect(error.toJSON())}`);
        } else {
          throw new Error(`Something happened in setting up the request that triggered an Error\n : ${inspect(error.message)}`);
        }
      }

      throw new Error(`\nUnknown error: ${error}`);
    }
  }

  async updateRun(items: ZephyrTestResult[]): Promise<string> {
    const URL = `${this.url}/testrun/${this.testRunKey}/testresults`;

    const updatedResults = items.map(({ executionDate, ...rest }) => ({
      ...rest,
      actualEndDate: executionDate,
    }));

    try {
      const response = await this.axios.post(URL, updatedResults);

      if (response.status !== 201) throw new Error(`${response.status} - Failed to create test cycle`);

      console.log(`${bold(green(`✅ Test cycle ${this.testRunKey} has been updated`))}`);
      console.log(`${bold(green('👇 Check out the test result'))}`);
      console.log(`🔗 ${this.host}/secure/Tests.jspa#/testPlayer/${this.testRunKey}`);

      return response.data.id;
    } catch (error) {
      if (isAxiosError(error)) {
        console.error(`Config: ${inspect(error.config)}`);

        if (error.response) {
          throw new Error(
            `\nStatus: ${error.response.status} \nHeaders: ${inspect(error.response.headers)} \nData: ${inspect(error.response.data)}`,
          );
        } else if (error.request) {
          throw new Error(`The request was made but no response was received. \n Error: ${inspect(error.toJSON())}`);
        } else {
          throw new Error(`Something happened in setting up the request that triggered an Error\n : ${inspect(error.message)}`);
        }
      }

      throw new Error(`\nUnknown error: ${error}`);
    }
  }

  async uploadAttachments(items: ZephyrTestAttachment[], testrunKey: string): Promise<string[]> {
    if (this.testRunKey) {
      testrunKey = this.testRunKey?.toString();
    }
    let idsAttachments: string[] = [];
    const URL = `${this.url}/testrun/${testrunKey}/attachments`;
    for (const item of items) {
      try {
        const filePath = path.resolve(__dirname, item.attachment);
        const fileBuffer = readFileSync(filePath);
        // Convert the Buffer to a clean Uint8Array wrapper
        const uint8Array = new Uint8Array(fileBuffer);
        const formData = new FormData();
        const fileBlob = new Blob([uint8Array], { type: 'image/png' });
        formData.append('file', fileBlob, `${item.testCaseKey}.png`);
        const response = await this.axios.post(URL, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        if (response.status !== 201) throw new Error(`${response.status} - Failed to upload attachment`);

        const {
          data: { id },
        } = response;

        console.log(`${bold(green(`✅ Uploaded attachment ${id}`))}`);

        idsAttachments.push(response.data.id);
      } catch (error) {
        if (isAxiosError(error)) {
          console.error(`Config: ${inspect(error.config)}`);

          if (error.response) {
            throw new Error(
              `\nStatus: ${error.response.status} \nHeaders: ${inspect(error.response.headers)} \nData: ${inspect(error.response.data)}`,
            );
          } else if (error.request) {
            throw new Error(`The request was made but no response was received. \n Error: ${inspect(error.toJSON())}`);
          } else {
            throw new Error(`Something happened in setting up the request that triggered an Error\n : ${inspect(error.message)}`);
          }
        }

        throw new Error(`\nUnknown error: ${error}`);
      }
    }
    return idsAttachments;
  }

}
