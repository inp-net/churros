import { execa } from 'execa';
import { writeFileSync } from 'node:fs';
import path from 'node:path';

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

for (const relativePath of [
  'packages/app/src/lib/buildinfo.ts',
  'packages/api/src/lib/buildinfo.ts',
  'packages/docs/src/lib/buildinfo.ts',
]) {
  const filepath = path.join(toplevel.trim(), relativePath);
  console.log(`Injecting CURRENT_COMMIT="${hash}" into ${filepath}`);
  console.log(`Injecting CURRENT_VERSION=${tag} into ${filepath}`);
  writeFileSync(
    filepath,
    `export const CURRENT_COMMIT = "${hash}" as string;
export const CURRENT_VERSION = "${tag}" as string`,
  );
}
