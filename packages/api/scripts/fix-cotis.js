import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';

const p = new PrismaClient();
// @ts-ignore
const { users } = JSON.stringify(readFileSync('./dump-ldap.json'));

const aen7 = await p.contributionOption.findFirst({ where: { name: 'AEn7' } });
if (!aen7) throw new Error('AEn7 not found');

for (const { uid, inscritAE } of users) {
  const user = await p.user.findUnique({ where: { uid } });
  if (!user) {
    console.error(`- @${uid} not found`);
    continue;
  }
  if (inscritAE) {
    const { id } = await p.contribution.upsert({
      where: {
        optionId_userId: {
          userId: user.id,
          optionId: aen7.id,
        },
      },
      create: {
        userId: user.id,
        optionId: aen7.id,
        paid: true,
      },
      update: {
        paid: true,
      },
    });
    console.log(`- @${uid} created contribution ${id}`);
  }
}
