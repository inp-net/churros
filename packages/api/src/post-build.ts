const start = performance.now();

import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { mailTemplatesDirectory } from './mail-templates/props.js';
import { writeSchema } from './schema.js';
await writeSchema();

console.info(
  '✨ Schema exported in \u001B[36;1m%s ms\u001B[0m',
  Number((performance.now() - start).toPrecision(3)),
);

const templates = await readdir(mailTemplatesDirectory);

const templatesDestinationDirectory = mailTemplatesDirectory.replace('src/', 'build/src/');

await Promise.all(
  templates.map(async (template) => {
    if (path.extname(template) !== '.mjml') return;
    await writeFile(
      path.join(templatesDestinationDirectory, template),
      await readFile(path.join(mailTemplatesDirectory, template), 'utf8'),
    );
    console.info('📄 Copied mail template \u001B[36;1m%s\u001B[0m', template);
  }),
);

// eslint-disable-next-line unicorn/no-process-exit
process.exit(0);
