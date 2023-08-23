import { exec } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

exec('git rev-parse HEAD').stdout?.on('data', (hash: string) => {
  if (hash.toString().trim() === '') {
    return;
  }

  exec('git rev-parse --show-toplevel').stdout?.on('data', (toplevel: string) => {
    if (toplevel.toString().trim() === '') return;
    const filepath = path.join(toplevel.trim(), './packages/app/src/lib/buildinfo.ts');

    exec(
      'git for-each-ref refs/tags --sort=-taggerdate --format=%(refname:short) --count=1 --points-at=HEAD'
    ).stdout?.on('data', (tag: string) => {
      console.log(`Injecting CURRENT_COMMIT="${hash.trim()}"`);
      console.log(`Injecting CURRENT_VERSION=${tag.trim() || 'alpha'}`);
      const content = readFileSync(filepath)
        .toString()
        .replace(/^CURRENT_COMMIT=.*$/m, `CURRENT_COMMIT="${hash.trim()}"`)
        .replace(/^CURRENT_VERSION=.*$/m, `CURRENT_VERSION="${tag.trim() || 'alpha'}"`);

      writeFileSync(filepath, content);
    });
  });
});
