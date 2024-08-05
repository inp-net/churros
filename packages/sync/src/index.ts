import { PrismaClient } from '@churros/db/prisma';
import process from 'node:process';
import { type ILogObj, Logger } from 'tslog';
import type { Module } from './modules/module.js';

const prisma = new PrismaClient();

const logger: Logger<ILogObj> = new Logger({
  minLevel: process.env.SYNC_LOG_LEVEL || 2,
  hideLogPositionForProduction: process.env.NODE_ENV === 'production',
  type: process.env.SYNC_LOGS || 'pretty',
  name: '@churros/sync',
});

logger.info('Starting sync');
for (const module of process.env.SYNC_MODULES.split(',')) {
  try {
    const mod: Module = await import(`./modules/${module}/index.js`);
    await mod.default.sync(prisma, logger);
  } catch (error) {
    logger.error(`Failed to sync module ${module}`, error);
  }
}
logger.info('Sync complete');
