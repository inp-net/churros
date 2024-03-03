#!/usr/bin/env tsx
// Loop through each file of process.argv

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import * as path from 'node:path';

for (const directory of process.argv.slice(2)) {
  // Check if +page.ts and +page.svelte exist in that directory, and that +page.gql does not exist
  const ok =
    existsSync(path.join(directory, '+page.ts')) &&
    existsSync(path.join(directory, '+page.svelte')) &&
    !existsSync(path.join(directory, '+page.gql'));

  if (!ok) {
    console.error('Invalid directory');
    process.exit(1);
  }

  // Prepend every line with #
  const content = readFileSync(path.join(directory, '+page.ts'), 'utf8')
    .split('\n')
    .map((line) => `# ${line}`)
    .join('\n');

  // Write the content back to name file but with a .gql extension
  writeFileSync(path.join(directory, '+page.gql'), content);

  // Modify PageData import in +page.svelte: replace "from './$types'" with "from './$houdini'

  const pageSveltePath = path.join(directory, '+page.svelte');
  const pageSvelteContent = readFileSync(pageSveltePath, 'utf8');
  let newPageSvelteContent = pageSvelteContent.replace(/from '\.\/\$types'/, `from './$houdini'`);

  // Append $: ({} = data) after export let data: PageData;
  newPageSvelteContent = newPageSvelteContent.replace(
    /(\s*)export let data: PageData;/,
    `$1export let data: PageData;\n$1$$: ({} = data);`,
  );

  writeFileSync(pageSveltePath, newPageSvelteContent);
}

if (process.argv.length < 3) {
  console.error('No files provided');
  process.exit(1);
}

// If only one file, open the new one in vscode
if (process.argv.length === 3) execFileSync('code', [path.join(process.argv[2], '+page.gql')]);
