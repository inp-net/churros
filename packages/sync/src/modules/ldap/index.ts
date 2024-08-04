import type { PrismaClient } from '@churros/db/prisma';
import { Client } from '@inp-net/ldap7';
import process from 'node:process';
import type { ILogObj, Logger } from 'tslog';

import type { Sync } from '../module.js';
import groups from './groups.js';
import schools from './schools.js';
import users from './users.js';

const open = async (logger: Logger<ILogObj>) => {
  const ldap = Client.getInstance('pretty', logger);
  await ldap.setup(
    {
      url: process.env.LDAP_URL,
    },
    process.env.LDAP_BIND_DN,
    process.env.LDAP_BIND_PASSWORD,
    process.env.LDAP_BASE_DN,
  );
  await ldap.connect();
};

const close = async () => {
  const ldap = Client.getInstance();
  await ldap.disconnect();
};

const sync = async (prisma: PrismaClient, logger: Logger<ILogObj>) => {
  const sublogger = logger.getSubLogger({ name: 'ldap' });
  logger.info('Syncing LDAP data');
  await open(sublogger);
  await schools.sync(prisma);
  await users.sync(prisma);
  await groups.sync(prisma);
  await close();
  logger.info('LDAP data synced');
};

export default {
  sync,
} as Sync;
