import { bold, dim, green, red } from 'kleur/colors';
import { readFile, writeFile } from 'node:fs/promises';

const OK = bold(dim('OK'));
const YEP = bold(green('YEP'));
const NOPE = bold(red('NOPE'));

function importsGlobalMeStore(source: string) {
  const symbolsFromLibSession = new Set<string>();

  for (const line of source.split('\n')) {
    const match = line.match(/^\s*import\s+{\s*(\S+)\s*}\s+from\s+(["'])\$lib\/session(?:\.js)?\2/);
    if (match) {
      match[1]
        .split(',')
        .map((s) => s.trim())
        // eslint-disable-next-line unicorn/no-array-for-each
        .forEach((element) => {
          symbolsFromLibSession.add(element);
        });
    }
  }

  return symbolsFromLibSession.has('me');
}

function importsZeus(source: string) {
  return /^\s*import.+from\s+(["'])\$lib\/zeus(?:\.js)?\1/m.test(source);
}

function importsFromHoudini(source: string) {
  return /^\s*import.+from\s+(["'])(?:\.\/)?\$houdini\1/m.test(source);
}

function isOK(source: string) {
  return !importsGlobalMeStore(source) && !importsZeus(source);
}

function isHoudinified(source: string) {
  return isOK(source) && importsFromHoudini(source);
}

// read files given in arguments
const args = process.argv.slice(2);

const results = await Promise.all(
  args.map(async (filename) => {
    const contents = await readFile(filename, 'utf8');
    const houdinified = isHoudinified(contents);
    const ok = isOK(contents);
    console.info(houdinified ? YEP : ok ? OK : NOPE, '\t', filename);
    return { houdinified, ok, filename };
  }),
);

// print percentage of houdinified files over houdinifiable (i.e. houdinified OR not houdinified and not OK) files
console.info(
  `
Legend \t__________________________________
${OK}   \tdoes not import global $me or zeus
${YEP}  \tuses Houdini
${NOPE} \timports global $me or zeus
`,
);

await writeFile(
  'houdification-progress.csv',
  results
    .map(
      ({ houdinified, ok, filename }) =>
        `${filename},${houdinified ? 'houdinified' : ok ? 'ok' : 'nope'}`,
    )
    .join('\n'),
);

function countif<T>(arr: T[], predicate: (t: T) => boolean) {
  return arr.reduce((count, t) => count + (predicate(t) ? 1 : 0), 0);
}

console.info(
  `${OK}   \t${countif(results, ({ ok }) => ok)} files (${(countif(results, ({ ok }) => ok) / results.length) * 100}%)
${YEP}  \t${countif(results, ({ houdinified }) => houdinified)} files (${(countif(results, ({ houdinified }) => houdinified) / results.length) * 100}%)
${NOPE} \t${countif(results, ({ ok, houdinified }) => !ok && !houdinified)} files (${(countif(results, ({ ok, houdinified }) => !ok && !houdinified) / results.length) * 100}%)`,
);

console.info(
  `${(countif(results, ({ houdinified }) => houdinified) / countif(results, ({ ok, houdinified }) => houdinified || (!ok && !houdinified))) * 100}% houdinified / houdinifiable files`,
);
console.info(`${countif(results, ({ ok }) => !ok)} files to go`);
