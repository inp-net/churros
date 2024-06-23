import { execa } from 'execa';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const GENERATED_START_MARKER = '// @generated buildinfo';
const GENERATED_END_MARKER = '// end generated buildinfo';

const stub = process.argv.length >= 3 && process.argv[2] === '--stub';

/** files to inject in */
let targets = [
  'packages/app/src/lib/buildinfo.ts',
  'packages/api/src/lib/buildinfo.ts',
  'packages/docs/src/lib/buildinfo.ts',
  'packages/app/svelte.config.js',
];

// TODO use command line arguments (this) to not inject in e.g. API package from app package's script
if (stub && process.argv.length >= 4) targets = process.argv.slice(3);
if (!stub && process.argv.length >= 3) targets = process.argv.slice(2);

console.info(`Injecting build info into ${targets.join(', ')}`);

async function git(args: string): Promise<string> {
  const { stdout } = await execa('git', args.split(' '));
  return stdout;
}

const hash = stub ? 'dev' : await git('rev-parse HEAD').then((hash) => hash.trim());
const toplevel = await git('rev-parse --show-toplevel');
const tag = stub
  ? 'dev'
  : await git('for-each-ref refs/tags --sort=-v:refname --format=%(refname:short) --count=1').then(
      (tag) => tag.trim().replace(/^v/, ''),
    );

const variables = {
  CURRENT_COMMIT: hash,
  CURRENT_VERSION: tag,
};

function singlequotes(literal: string): string {
  if ((literal.match(/"/g) || []).length !== 2) return literal;
  return `'${literal.replace(/"/g, '')}'`;
}

function constDeclaration(
  name: string,
  value: unknown,
  { typescript = true, exported = true } = {},
) {
  return `${exported ? 'export ' : ''}const ${name} = ${singlequotes(JSON.stringify(value))}${typescript ? ' as string' : ''};`;
}

function replaceBetweenLines(start: string, end: string, replacement: string, contents: string) {
  const lines = contents.split('\n');
  const startIndex = lines.findIndex((line) => line.trim().includes(start.trim()));
  const endIndex = lines.findIndex((line) => line.trim().includes(end.trim()));
  return [...lines.slice(0, startIndex + 1), replacement, ...lines.slice(endIndex)].join('\n');
}

await Promise.all(
  targets.map(async (relativePath) => {
    const filepath = path.join(toplevel.trim(), relativePath);
    const typescript = path.extname(filepath) === '.ts';
    const oldContents = await readFile(filepath, 'utf-8').catch(() => '');

    /** isolated means the file contains nothing other than these two variables */
    const isolated =
      !oldContents.includes(GENERATED_START_MARKER) && !oldContents.includes(GENERATED_END_MARKER);

    const declarations: string[] = [];
    for (const [key, value] of Object.entries(variables)) {
      declarations.push(constDeclaration(key, value, { typescript, exported: isolated }));
      console.info(`Injecting ${key}=${JSON.stringify(value)} into ${relativePath}`);
    }

    await writeFile(
      filepath,
      isolated
        ? declarations.join('\n')
        : replaceBetweenLines(
            GENERATED_START_MARKER,
            GENERATED_END_MARKER,
            declarations.join('\n'),
            oldContents,
          ),
    );
  }),
);
