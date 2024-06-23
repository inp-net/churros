import { execa } from 'execa';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const GENERATED_START_MARKER = '// @generated buildinfo';
const GENERATED_END_MARKER = '// end generated buildinfo';

const stub = process.argv.length >= 2 && process.argv[2] === '--stub';

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

function constDeclaration(
  name: string,
  value: unknown,
  { typescript = true, exported = true } = {},
) {
  return `${exported ? 'export ' : ''}const ${name} = ${JSON.stringify(value)}${typescript ? ' as string' : ''};`;
}

function replaceBetweenLines(start: string, end: string, replacement: string, contents: string) {
  const lines = contents.split('\n');
  const startIndex = lines.findIndex((line) => line.trim().includes(start.trim()));
  const endIndex = lines.findIndex((line) => line.trim().includes(end.trim()));
  return [...lines.slice(0, startIndex + 1), replacement, ...lines.slice(endIndex)].join('\n');
}

for (const relativePath of [
  'packages/app/src/lib/buildinfo.ts',
  'packages/api/src/lib/buildinfo.ts',
  'packages/docs/src/lib/buildinfo.ts',
  'packages/app/svelte.config.js',
]) {
  const filepath = path.join(toplevel.trim(), relativePath);
  const typescript = path.extname(filepath) === '.ts';
  const oldContents = readFileSync(filepath, 'utf-8');

  /** isolated means the file contains nothing other than these two variables */
  const isolated =
    !oldContents.includes(GENERATED_START_MARKER) && !oldContents.includes(GENERATED_END_MARKER);

  const declarations = [
    constDeclaration('CURRENT_COMMIT', hash, { typescript, exported: isolated }),
    constDeclaration('CURRENT_VERSION', tag, { typescript, exported: isolated }),
  ];

  for (const declaration of declarations) {
    console.info(`Injecting ${declaration} into ${filepath}`);
  }

  writeFileSync(
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
}
