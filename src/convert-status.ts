import type { AxiosRequestConfig } from 'axios';

export interface ZephyrOptions extends AxiosRequestConfig {
  authorizationToken: string;
  projectKey: string;
  testCycle?: ZephyrTestCycle;
  nodeInternalTlsRejectUnauthorized?: '0' | '1'; // NODE_TLS_REJECT_UNAUTHORIZED
  ignoreFailedRetries?: boolean;
}

export type ZephyrStatus = 'Passed' | 'Failed' | 'Blocked' | 'Not Executed' | 'In Progress';

export type ZephyrTestResult = {
  result: ZephyrStatus;
  testCase: {
    key: string;
    comment: string | undefined;
  };
};

export type ZephyrTestCycle = {
  name?: string;
  description?: string;
  jiraProjectVersion?: number;
  folderId?: number;
  customFields?: {
    [key: string]: string;
  };
};

export function convertStatus(status: string): ZephyrStatus {
  if (status === 'passed') return 'Passed';
  if (status === 'failed') return 'Failed';
  if (status === 'timedOut') return 'Blocked';

  return 'Not Executed';
}
