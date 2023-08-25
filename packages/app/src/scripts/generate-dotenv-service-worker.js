import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

const here = path.dirname(import.meta.url.replace(/^file:/, ''));

dotenv.config({
  path: path.join(here, '../../.env'),
});

const filepath = path.join(here, '../service-worker.ts');

const literal = JSON.stringify(
  process.env.NODE_ENV === 'develoment'
    ? 'http://localhost:4000/storage'
    : 'https://centraverse.k8s.inpt.fr/storage'
);
console.log(`Injecting PUBLIC_STORAGE_URL=${literal} into ${filepath}`);

writeFileSync(
  filepath,
  readFileSync(filepath)
    .toString('utf8')
    .replace(
      /^const\s+PUBLIC_STORAGE_URL\s+=.+$/gm,
      `const PUBLIC_STORAGE_URL = /* @generated */ ${literal}`
    )
);
