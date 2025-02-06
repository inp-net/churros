import { prisma } from '#lib';
import { api } from './express.js';

api.get('/dump/migrations/list', async (_, res) => {
  const migrations: Array<{ migration_name: string; checksum: string }> =
    await prisma.$queryRaw`select migration_name, checksum from _prisma_migrations where finished_at is not null order by migration_name`;
  res.send(
    migrations
      .map((m) => [m.migration_name, m.checksum] as const)
      .map(([name, sum]) => `${name.padEnd(150)} ${sum}`)
      .join('\n'),
  );
});

api.get('/dump/migrations/names', async (_, res) => {
  const migrations: Array<{ migration_name: string }> =
    await prisma.$queryRaw`select migration_name from _prisma_migrations where finished_at is not null order by migration_name`;
  res.send(migrations.map((m) => m.migration_name).join('\n'));
});
