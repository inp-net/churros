/* eslint-disable @typescript-eslint/prefer-ts-expect-error */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
const map = {};

/**
 * @param {string} line
 * @returns {string | undefined}
 */
const declaredModelName = (line) => {
  const match = /^model\s+([\dA-Za-z]\w*)\s+{$/.exec(line);
  return match ? match[1] : undefined;
};

const idPrefixUsed = (/** @type {string} */ line) => {
  const match = /nanoid\('(\w+):'/.exec(line);
  return match ? match[1] : undefined;
};

// We loop through every line.
// If we find a model declaration, we look for the associated id prefix in the next line.

const readFrom = path.join(
  path.dirname(import.meta.url.replace(/^file:/, '')),
  '../prisma/schema.prisma'
);
const lines = readFileSync(readFrom, 'utf8').split('\n');

console.log(`Read from ${readFrom}`);

for (const [index, line] of lines.entries()) {
  const modelName = declaredModelName(line);
  if (modelName) {
    // @ts-expect-error - we know the next line exists
    const idPrefix = idPrefixUsed(lines[index + 1]);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (idPrefix) map[idPrefix] = modelName;
  }
}

const writeTo = path.join(path.dirname(import.meta.url.replace(/^file:/, '')), '../src/builder.ts');
console.log(`Writing to ${writeTo}`);

const writeToLines = readFileSync(writeTo, 'utf8').split('\n');

let insideGeneratedContent = false;
for (const [index, line] of writeToLines.entries()) {
  if (!insideGeneratedContent && line.startsWith('/* @generated from schema')) {
    writeToLines[index] = `/* @generated from schema by ${
      import.meta.url
    } */ export const ID_PREFIXES_TO_TYPENAMES = ${JSON.stringify(
      map
    )}\n/* end @generated from schema */`;
    insideGeneratedContent = true;
  } else if (insideGeneratedContent && line.includes('/* end @generated from schema */')) {
    writeToLines[index] = '';
    insideGeneratedContent = false;
  } else if (insideGeneratedContent) {
    writeToLines[index] = '';
  } else {
    writeToLines[index] = line;
  }
}

writeFileSync(writeTo, writeToLines.join('\n'));
