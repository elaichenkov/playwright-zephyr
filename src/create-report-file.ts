import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export function createJsonReport(filename: string, filePath: string, executionResults: unknown): void {
  const jsonReport = JSON.stringify({ version: 1, executions: executionResults }, null, 2);
  const jsonReportPath = join(process.cwd(), filePath, filename);

  try {
    createDirectory(filePath);
    writeFileSync(jsonReportPath, jsonReport);
  } catch (error) {
    console.log(`Something went wrong while creating the report. ${error}`);

    throw error;
  }
}

function createDirectory(filePath: string) {
  if (!existsSync(filePath)) {
    mkdirSync(filePath, { recursive: true });
  }
}
