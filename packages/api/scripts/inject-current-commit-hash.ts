import { execa } from 'execa';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

async function git(args: string): Promise<string> {
  const { stdout } = await execa('git', args.split(' '));
  return stdout;
}

const hash = await git('rev-parse HEAD').then((hash) => hash.trim());
const toplevel = await git('rev-parse --show-toplevel');
const tag = await git(
  'for-each-ref refs/tags --sort=-v:refname --format=%(refname:short) --count=1',
).then((tag) => tag.trim().replace(/^v/, ''));
const filepath = path.join(toplevel.trim(), './packages/app/src/lib/buildinfo.ts');
console.log(`Injecting CURRENT_COMMIT="${hash}" into ${filepath}`);
console.log(`Injecting CURRENT_VERSION=${tag} into ${filepath}`);
let content = readFileSync(filepath)
  .toString()
  .replace(
    /export const CURRENT_COMMIT\s*=.*$/m,
    `export const CURRENT_COMMIT = "${hash}" as string`,
  )
  .replace(
    /export const CURRENT_VERSION\s*=.*$/m,
    `export const CURRENT_VERSION = "${tag}" as string`,
  );
writeFileSync(filepath, content);
