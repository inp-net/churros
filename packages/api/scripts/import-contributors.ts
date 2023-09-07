import { LydiaTransaction, PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';

const p = new PrismaClient();

const contributions = JSON.parse(readFileSync('./contributions.json', 'utf-8')) as Array<{
  user: { id: string };
  paid: boolean;
  transaction: LydiaTransaction;
}>;

const model = await p.contributionOption.findFirstOrThrow({ where: { name: 'AEn7' } });

for (const contribution of contributions) {
  await p.contribution.create({
    data: {
      user: { connect: { id: contribution.user.id } },
      paid: contribution.paid,
      option: { connect: { id: model.id } },
      transaction: {
        create: contribution.transaction,
      },
    },
  });
}
