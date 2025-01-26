import { prisma } from '#lib';
import { api } from './express';

api.get('/dump/migrations/list', async (req, res) => {
  const migrations =
    await prisma.$queryRaw`select migration_name, checksum from _prisma_migrations where finished_at is not null order by migration_name`;
  res.send(
    migrations
      .map((m) => [m.migration_name, m.checksum])
      .map(([name, sum]) => `${name.padEnd(150)} ${sum}`)
      .join('\n'),
  );
});

api.get('/dump/migrations/names', async (req, res) => {
  const migrations =
    await prisma.$queryRaw`select migration_name from _prisma_migrations where finished_at is not null order by migration_name`;
  res.send(migrations.map((m) => m.migration_name).join('\n'));
});
