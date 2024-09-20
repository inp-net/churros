import { execa } from 'execa';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const GENERATED_START_MARKER = '// @generated buildinfo';
const GENERATED_END_MARKER = '// end generated buildinfo';

const stub = process.argv.length >= 3 && process.argv[2] === '--stub';

type Package = 'api' | 'app' | 'sync' | 'db';

/** files to inject in */
let targets: Array<[string, Package]> = [
  ['packages/app/src/lib/buildinfo.ts', 'app'],
  ['packages/api/src/lib/buildinfo.ts', 'api'],
  ['packages/app/svelte.config.js', 'app'],
];

// TODO use command line arguments (this) to not inject in e.g. API package from app package's script
if (stub && process.argv.length >= 4)
  targets = process.argv.slice(3).map((arg) => arg.split(':') as [string, Package]);
if (!stub && process.argv.length >= 3)
  targets = process.argv.slice(2).map((arg) => arg.split(':') as [string, Package]);

async function git(args: string): Promise<string> {
  const additionalConfig = {
    // see https://stackoverflow.com/a/22634649/9943464
    'versionsort.suffix': '-alpha -beta -pre -rc',
  };
  const { stdout } = await execa('git', [
    '-c',
    ...Object.entries(additionalConfig).map(([k, v]) => `${k}='${v}'`),
    ...args.split(' '),
  ]);
  return stdout;
}

const hash = stub ? 'dev' : await git('rev-parse HEAD').then((hash) => hash.trim());
const toplevel = await git('rev-parse --show-toplevel');
const variables = {
  CURRENT_COMMIT: hash,
  CURRENT_VERSIONS: {
    api: process.env.TAG || 'dev',
    app: process.env.TAG || 'dev',
    sync: process.env.TAG || 'dev',
    db: process.env.TAG || 'dev',
  },
};

console.info(`Build info: ${JSON.stringify(variables)}`);
console.info(`Injecting into ${targets.join(', ')}`);

// Inject in graphinx config
const graphinxConfigPath = path.join(toplevel.trim(), 'packages/api/.graphinx.yaml');

await writeFile(
  graphinxConfigPath,
  (await readFile(graphinxConfigPath, 'utf-8'))
    .replace(
      /^(\s*)CURRENT_COMMIT: .+$/m,
      `$1CURRENT_COMMIT: ${JSON.stringify(variables.CURRENT_COMMIT)}`,
    )
    .replace(
      /^(\s*)CURRENT_COMMIT_SHORT: .+$/m,
      `$1CURRENT_COMMIT_SHORT: ${JSON.stringify(variables.CURRENT_COMMIT.slice(0, 7))}`,
    )
    .replace(
      /^(\s*)CURRENT_VERSION: .+$/m,
      `$1CURRENT_VERSION: ${JSON.stringify(variables.CURRENT_VERSIONS.api)}`,
    ),
);

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
  targets.map(async ([relativePath, pkg]) => {
    const filepath = path.join(toplevel.trim(), relativePath);
    const typescript = path.extname(filepath) === '.ts';
    const oldContents = await readFile(filepath, 'utf-8').catch(() => '');

    /** isolated means the file contains nothing other than these two variables */
    const isolated =
      !oldContents.includes(GENERATED_START_MARKER) && !oldContents.includes(GENERATED_END_MARKER);

    const declarations = [
      constDeclaration('CURRENT_COMMIT', variables.CURRENT_COMMIT, {
        typescript,
        exported: isolated,
      }),
      constDeclaration('CURRENT_VERSION', variables.CURRENT_VERSIONS[pkg], {
        typescript,
        exported: isolated,
      }),
    ];
    await writeFile(
      filepath,
      isolated
        ? declarations.join('\n') + '\n'
        : replaceBetweenLines(
            GENERATED_START_MARKER,
            GENERATED_END_MARKER,
            declarations.join('\n'),
            oldContents,
          ),
    );
  }),
);
