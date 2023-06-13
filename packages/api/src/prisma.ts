import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({ __internal: { debug: true } });
