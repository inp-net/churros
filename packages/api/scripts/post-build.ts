const start = performance.now();

import { writeSchema } from '../src/schema.js';
await writeSchema();

console.log(
  '✨ Schema exported in \u001B[36;1m%s ms\u001B[0m',
  Number((performance.now() - start).toPrecision(3))
);
