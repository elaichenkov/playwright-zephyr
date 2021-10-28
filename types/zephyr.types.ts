export type ZephyrOptions = {
  host: string,
  user?: string,
  password?: string,
  authorizationToken?: string,
  projectKey: string
}

export type ZephyrStatus = 'Pass' | 'Fail' | 'Blocked' | 'Not Executed' | 'In Progress';

export type ZephyrTestResult = {
  testCaseKey: string,
  status: ZephyrStatus,
  environment?: string,
  executionTime?: string,
  executionDate?: string
}