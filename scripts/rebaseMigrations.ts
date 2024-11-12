import { execSync } from 'node:child_process';
import { existsSync, rmSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import * as path from 'node:path';

try {
  // Get current branch name
  const currentBranch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();

  // Reset the environment
  try {
    execSync('yarn reset', { stdio: 'inherit' });
  } catch (error) {
    console.warn('yarn reset failed, but continuing:', error.message);
  }

  // Get all migration directories not present on main
  let migrationDirs = execSync(
    `git diff --name-status main...${currentBranch} -- packages/db/prisma/migrations/ | awk '$1 == "A" {print $2}' | xargs -n 1 dirname`,
  )
    .toString()
    .split('\n')
    .filter(Boolean);

  // Sort the migration directories
  migrationDirs = migrationDirs.sort();

  let commitBody = 'Rebased the following migrations:\n';

  for (let i = 0; i < migrationDirs.length; i++) {
    const dir = migrationDirs[i];
    const migrationName = path.basename(dir).replace(/^\d+_/, ''); // Remove numbers from start
    const fullPath = path.resolve(dir);

    // Remove the migration directory if it exists
    if (existsSync(fullPath)) {
      rmSync(fullPath, { recursive: true, force: true });

      // Reapply the migration
      execSync(`yarn migration ${migrationName}`, { stdio: 'inherit' });

      commitBody += `- ${migrationName}\n`;
    }
  }

  // Prepare commit message file
  const commitMessage = `chore(prisma): rebase migrations for current branch\n\n${commitBody.trim()}`;
  const commitFilePath = path.join(tmpdir(), 'commit_message.txt');
  writeFileSync(commitFilePath, commitMessage);

  // Add changes to git and make a single commit with a detailed body
  execSync('git add packages/db/prisma/migrations');
  execSync(`git commit --file=${commitFilePath}`);

  // Remove the temporary commit message file
  unlinkSync(commitFilePath);
} catch (error) {
  console.error('An error occurred:', error.message);
  process.exit(1);
}
