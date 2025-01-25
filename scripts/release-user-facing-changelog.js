import { readFileSync, writeFileSync } from 'node:fs';
import * as path from 'node:path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Get app version from package.json, or from args if provided
const args = process.argv.slice(2);

const packageJsonPath = path.join(__dirname, '../packages/app/package.json');

const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

const newVersion = args.at(0) || packageJson.version;

// Get current changelog

const changelogPath = path.join(__dirname, '../CHANGELOG.md');

const changelog = readFileSync(changelogPath, 'utf-8');

// If changelog already contains the new version, exit
if (new RegExp(`^## \\[${newVersion}\\]`, 'm').test(changelog)) {
  console.error(`Changelog already contains version ${newVersion}, nothing to do.`);
  process.exit(0);
}

// Update changelog

console.info(`Updating changelog to version ${newVersion}`);

// [Unreleased] -> [version] - date

let newChangelog = changelog.replace(
  /^## \[Unreleased\]/m,
  `## [Unreleased]\n\n## [${newVersion}] - ${new Date().toISOString().split('T')[0]}`,
);

// regenerate [version]: https://git.inpt.fr/churros/churros/-/releases/tag/v[version]

// Start by deleting all lines after ^[unreleased]: https://....$

const tagsStartLineIndex = newChangelog.search(
  /\[Unreleased\]: https:\/\/git.inpt.fr\/churros\/churros\/-\/compare\/.*/,
);

newChangelog = newChangelog.slice(0, tagsStartLineIndex);

// Regenerate the tag links definitions: get every ## [version], and add a new line with the tag link

const versions = newChangelog
  .match(/## \[.*\]/g)
  ?.map((v) => v.slice(4, -1))
  .filter((v) => v !== 'Unreleased');

function tagOfVersion(version) {
  if (version.startsWith('1.')) return `v${version}`;
  return `@churros%2Fapp@${version}`;
}

newChangelog += `[Unreleased]: https://git.inpt.fr/churros/churros/-/compare/${tagOfVersion(newVersion)}...main\n`;

if (versions) {
  versions.forEach((version) => {
    newChangelog += `[${version}]: https://git.inpt.fr/churros/churros/-/releases/${tagOfVersion(version)}\n`;
  });
}

writeFileSync(changelogPath, newChangelog);
