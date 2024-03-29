import dotenv from 'dotenv';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const here = path.dirname(import.meta.url.replace(/^file:/, ''));

dotenv.config({
  path: path.join(here, '../../.env'),
});

const filepath = path.join(here, '../service-worker.ts');

const literal =
  process.env.NODE_ENV === 'develoment'
    ? JSON.stringify('http://localhost:4000/storage')
    : // eslint-disable-next-line no-template-curly-in-string
      '`https://${sw.location.hostname}/storage`';
console.log(`Injecting PUBLIC_STORAGE_URL=${literal} into ${filepath}`);

writeFileSync(
  filepath,
  readFileSync(filepath)
    .toString('utf8')
    .replaceAll(
      /^const\s+PUBLIC_STORAGE_URL\s+=.+$/gm,
      `const PUBLIC_STORAGE_URL = /* @generated */ ${literal}`,
    ),
);
