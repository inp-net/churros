/*
A script that writes src/lib/components/index.ts, with each file a

export { default as FileName } from './FileName.svelte';

For every .svelte file in src/lib/components/.

*/
import { readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const here = path.dirname(new URL(import.meta.url).pathname);

const components = readdirSync(path.join(here, '../lib/components'))
  .filter((file) => file.endsWith('.svelte'))
  .map((file) => file.slice(0, -7));

const content = components
  .map(
    (component) =>
      `export { default as ${component.replaceAll('.', '_')} } from './${component}.svelte';`,
  )
  .join('\n');

writeFileSync(path.join(here, '../lib/components/index.ts'), content);
