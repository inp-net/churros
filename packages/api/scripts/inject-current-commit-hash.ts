import { exec } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

exec('git rev-parse HEAD').stdout?.on('data', (hash: string) => {
  if (hash.toString().trim() === '') {
    return;
  }

  exec('git rev-parse --show-toplevel').stdout?.on('data', (toplevel: string) => {
    if (toplevel.toString().trim() === '') return;
    const filepath = path.join(toplevel.trim(), './packages/app/.env');
    console.log(`Injecting PUBLIC_CURRENT_COMMIT="${hash.trim()}"`);
    const content = readFileSync(filepath)
      .toString()
      .replace(/^PUBLIC_CURRENT_COMMIT=.*$/m, `PUBLIC_CURRENT_COMMIT="${hash.trim()}"`);

    writeFileSync(filepath, content);
  });
});
