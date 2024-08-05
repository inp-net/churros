import type { PrismaClient } from '@churros/db/prisma';
import type { ILogObj, Logger } from 'tslog';

export interface Module {
  default: Sync;
}

export interface Sync {
  sync: (prisma: PrismaClient, logger: Logger<ILogObj>) => Promise<void>;
}
