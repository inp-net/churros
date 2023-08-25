import { execa } from 'execa';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

async function git(args: string): Promise<string> {
  const { stdout } = await execa('git', args.split(' '));
  return stdout;
}

const hash = await git('rev-parse HEAD');
const toplevel = await git('rev-parse --show-toplevel');
const tag = await git('for-each-ref refs/tags --sort=-refname --format=%(refname:short) --count=1');
const filepath = path.join(toplevel.trim(), './packages/app/src/lib/buildinfo.ts');
console.log(`Injecting CURRENT_COMMIT="${hash.trim()}" into ${filepath}`);
console.log(`Injecting CURRENT_VERSION=${tag.trim() || 'alpha'} into ${filepath}`);
const content = readFileSync(filepath)
  .toString()
  .replace(/^CURRENT_COMMIT=.*$/m, `CURRENT_COMMIT="${hash.trim()}"`)
  .replace(/^CURRENT_VERSION=.*$/m, `CURRENT_VERSION="${tag.trim() || 'alpha'}"`);
writeFileSync(filepath, content);
