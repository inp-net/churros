import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'node:fs';
import type { LDAPTypes } from './ldap-types.js';

const p = new PrismaClient();

const { users } = JSON.parse(readFileSync('./dump-ldap.json', 'utf-8')) as LDAPTypes;

for (const { uid, loginTP } of users) {
  console.log(`${uid} => ${loginTP}`);
  await p.user.update({
    where: { uid },
    data: {
      schoolUid: loginTP,
    },
  });
}
