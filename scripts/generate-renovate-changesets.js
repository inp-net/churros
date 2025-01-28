import { execSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';

// Helper to execute a shell command and return output as a trimmed string
function exec(command) {
  return execSync(command, { encoding: 'utf-8' }).trim();
}

// Create .changeset directory if it doesn't exist
const changesetDir = path.resolve('.changeset');
if (!existsSync(changesetDir)) {
  mkdirSync(changesetDir);
}

// Get the latest tagged commit
const latestTag = exec('git describe --tags --abbrev=0');
console.info(`Latest tag: ${latestTag}`);

// Get all merge commits from renovate branches until the latest tagged commit
const mergeCommits = exec(
  `git log ${latestTag}..HEAD --merges --pretty=format:'%H' --grep='renovate/'`,
).split('\n');

for (const commitHash of mergeCommits) {
  if (!commitHash.trim()) continue;
  console.info(`Processing merge commit: ${commitHash}`);

  // Extract the branch name from the merge commit's message
  const branchName = exec(`git show -s --format='%B' ${commitHash} | head -n 1`).replace(
    /^Merge branch 'renovate\/(.+?)'.*$/,
    '$1',
  );

  // Create a new changeset file
  const changesetFile = path.join(changesetDir, `${branchName}.md`);

  // Get the package.json files changed in the merge commit
  const changedFiles = exec(`git diff ${commitHash}~1 ${commitHash} --name-only`)
    .split('\n')
    .filter((file) => file.endsWith('package.json'));

  // Process each package.json file to extract the package name
  const changedPackageNames = [];
  for (const pkgFile of changedFiles) {
    if (pkgFile.trim()) {
      const pkgPath = path.resolve(pkgFile);
      const pkgJson = JSON.parse(readFileSync(pkgPath, { encoding: 'utf-8' }));
      // Root package contains meta-only deps
      if (pkgJson.name === 'churros') continue;
      changedPackageNames.push(pkgJson.name);
    }
  }

  console.info(
    `Changed packages: ${changedPackageNames} ${changedPackageNames.length === 0 ? '(note, root package is excluded)' : ''}`,
  );
  if (!changedPackageNames.length) continue;

  writeFileSync(changesetFile, '---\n', { encoding: 'utf-8' });

  for (const pkgName of changedPackageNames) {
    writeFileSync(changesetFile, `'${pkgName}': patch\n`, {
      encoding: 'utf-8',
      flag: 'a',
    });
  }

  // Append the YAML frontmatter closing
  writeFileSync(changesetFile, '---\n\n', { encoding: 'utf-8', flag: 'a' });

  // Append the original commit message
  const originalMessage = exec(`git log -1 --pretty=%B ${commitHash}`)
    .trim()
    .split('\n')
    .slice(1)
    .filter(Boolean)
    .map((line) => line.replace(/^See merge request .+?!(\d+)$/i, '(!$1)'))
    .join('  ');
  writeFileSync(changesetFile, `${originalMessage}\n`, {
    encoding: 'utf-8',
    flag: 'a',
  });

  // Stage the changeset file
  exec(`git add ${changesetFile}`);
}

// Check if any changesets were created/changed
const changesetFiles = exec(`git diff --name-only --cached`).split('\n').filter(Boolean);
if (changesetFiles.length) {
  console.log('Changesets created/changed:');
  console.log(changesetFiles.join('\n'));
  // Commit all staged changesets in a single commit
  exec(`git commit -n -m "chore(changesets): add changesets for renovate branches"`);
} else {
  console.log('No changesets created/changed');
}
