import type { AxiosRequestConfig } from 'axios';

export interface ZephyrOptions extends AxiosRequestConfig {
  host: string;
  user?: string;
  password?: string;
  authorizationToken?: string;
  projectKey: string;
  environment?: string;
}

export type ZephyrStatus = 'Passed' | 'Failed' | 'Blocked' | 'Not Executed' | 'In Progress';

export type ZephyrTestResult = {
  testCaseKey: string;
  status: ZephyrStatus;
  environment?: string;
  executionTime?: string;
  executionDate?: string;
};
