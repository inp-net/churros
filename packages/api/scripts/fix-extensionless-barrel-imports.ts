import { execSync } from 'child_process';
import * as fs from 'fs';
import { glob } from 'glob';

async function main() {
  try {
    // Check if script is running from the correct directory
    const currentDir = process.cwd();
    const gitTopLevelDir = execSync('git rev-parse --show-toplevel', { encoding: 'utf-8' }).trim();
    const apiDir = `${gitTopLevelDir}/packages/api`;
    if (currentDir !== apiDir) {
      console.error('Please run this script from packages/api');
      process.exit(1);
    }

    // Find and fix extension-less imports
    let fixedFilesCount = 0;
    const files = await glob('src/**/*.ts', { nodir: true }).catch((error) => {
      console.error('An error occurred while searching for files:', error);
      process.exit(1);
    });

    for (const file of files) {
      await fixImports(file);
      fixedFilesCount++;
      if (fixedFilesCount === files.length) {
        console.log(`Fixed extension-less imports from barrelsby in ${fixedFilesCount} files`);
      }
    }
  } catch (error) {
    console.error('An error occurred:', error);
    process.exit(1);
  }
}

async function fixImports(filePath: string) {
  try {
    let fileContent = fs.readFileSync(filePath, 'utf-8');

    // Fix extension-less imports
    fileContent = fileContent.replace(/(\bfrom\s+['"]\..*)(["'])/g, '$1.js$2');
    fileContent = fileContent.replace(/(\.js){2,}/g, '.js');

    fs.writeFileSync(filePath, fileContent, 'utf-8');
  } catch (error) {
    console.error(`Error fixing imports in file ${filePath}:`, error);
  }
}

main();
