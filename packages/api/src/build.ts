const start = performance.now();

import { writeSchema } from "./schema.js";
await writeSchema();

console.log(
  "✨ Schema exported in \u001b[36;1m%s ms\u001b[0m",
  Number((performance.now() - start).toPrecision(3))
);
