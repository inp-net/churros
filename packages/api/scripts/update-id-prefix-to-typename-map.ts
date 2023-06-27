import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
const map: Record<string, string> = {};

/**
 * @param {string} line
 * @returns {string | undefined}
 */
const declaredModelName = (line: string): string | undefined => {
  const match = /^model\s+([\dA-Za-z]\w*)\s+{$/.exec(line);
  return match ? match[1] : undefined;
};

const idPrefixUsed = (line: string) => {
  const match = /nanoid\('(\w+):'/.exec(line);
  return match ? match[1] : undefined;
};
// We loop through every line.
// If we find a model declaration, we look for the associated id prefix in the next line.

const readFrom = path.join(
  path.dirname(import.meta.url.replace(/^file:/, '')).replace('build/', ''),
  '../prisma/schema.prisma'
);
const lines = readFileSync(readFrom, 'utf8').split('\n');

console.log(`Constructing ID_PREFIXES_TO_TYPENAMES from ${readFrom}`);

function updateInFile(filename: string, exported: boolean): void {
  for (const [index, line] of lines.entries()) {
    const modelName = declaredModelName(line);
    if (modelName) {
      const idPrefix = idPrefixUsed(lines[index + 1]!);
      if (idPrefix) map[idPrefix] = modelName;
    }
  }

  const writeTo = path.join(
    path.dirname(import.meta.url.replace(/^file:/, '')).replace('build/', ''),
    filename
  );
  console.log(`Injecting ID_PREFIXES_TO_TYPENAMES in ${writeTo}`);

  const writeToLines = readFileSync(writeTo, 'utf8').split('\n');

  let insideGeneratedContent = false;
  for (const [index, line] of writeToLines.entries()) {
    if (!insideGeneratedContent && line.startsWith('/* @generated from schema')) {
      writeToLines[index] = `/* @generated from schema by ${import.meta.url} */ ${
        exported ? 'export ' : ''
      }const ID_PREFIXES_TO_TYPENAMES = ${JSON.stringify(map)}\n/* end @generated from schema */`;
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
}

updateInFile('../src/builder.ts', true);
updateInFile('../../app/src/routes/bookings/[pseudoID]/+page.server.ts', false);
