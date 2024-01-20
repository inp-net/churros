const start = performance.now();

import { writeSchema } from './schema.js';
await writeSchema();

console.info(
  '✨ Schema exported in \u001B[36;1m%s ms\u001B[0m',
  Number((performance.now() - start).toPrecision(3)),
);

// eslint-disable-next-line unicorn/no-process-exit
process.exit(0);
