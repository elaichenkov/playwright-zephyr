import { join } from 'path';
import AdmZip from 'adm-zip';

export function archiveReport(filename: string, filePath: string): string {
  try {
    const zip = new AdmZip();
    const jsonReportPath = join(process.cwd(), filePath, filename);
    const zipPath = join(process.cwd(), filePath, `${filename}.zip`);

    zip.addLocalFile(jsonReportPath);
    zip.writeZip(zipPath);

    return zipPath;
  } catch (error) {
    console.log(`Something went wrong while archiving the report. ${error}`);

    throw error;
  }
}
