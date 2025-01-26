import { execSync } from 'node:child_process';
import { readdirSync, writeFileSync } from 'node:fs';

// First CLI arg tells us if we are checking against an MR or against prod
const referenceType = process.argv[2];
if (!['prod', 'tag', 'main'].includes(referenceType)) {
  console.error('Invalid reference type: must be one of "prod", "tag" or "main"');
  process.exit(1);
}

function migrationListFromFilessytem() {
  return readdirSync('packages/db/prisma/migrations').filter((m) => m !== 'migration_lock.toml');
}

// Output file list of current migrations
const migrations = migrationListFromFilessytem();
let referenceMigrations = [];

if (referenceType === 'prod') {
  referenceMigrations = await fetch(process.env.MIGRATION_NAMES_ENDPOINT)
    .then((res) => res.text())
    .then((text) => text.split('\n'));
} else {
  if (referenceType === 'main') {
    execSync('git switch main --track origin/main');
  } else {
    // Get latest git tag starting with @churros/db@...
    const latestTag = execSync('git describe --abbrev=0 --tags --match "@churros/db@*"')
      .toString()
      .trim();

    // Get list of migrations from latest tag
    execSync(`git switch --detach ${latestTag}`);
  }
  referenceMigrations = migrationListFromFilessytem();
}

let zipped = migrations.map((migration, i) => [
  migration,
  i < referenceMigrations.length ? referenceMigrations[i] : null,
]);

// Remove pairs where the migration is the same, until the first different migration
let divergenceIndex = zipped.findIndex(([a, b]) => a !== b);
if (divergenceIndex === -1) {
  process.exit(0);
}
zipped = zipped.slice(divergenceIndex);

if (zipped.length === 0) {
  process.exit(0);
}

console.log(`Migrations diverged at ${zipped[0]?.[0]} index ${divergenceIndex}`);

writeFileSync('migrations.prod', referenceMigrations.join('\n'));
writeFileSync('migrations.current', migrations.join('\n'));

try {
  execSync('diff -y migrations.prod migrations.current', { stdio: 'inherit' });
} catch (e) {}

console.log('\n\n');

if (zipped.some(([_, prod]) => prod !== null)) {
  console.error('Migrations are not coherent with the latest tag');
  console.log(
    'Some migrations exist on main but were made after some migrations that you want to add',
  );
  process.exit(1);
}
