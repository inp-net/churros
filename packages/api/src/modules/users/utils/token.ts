import { prisma } from '#lib';
import { CredentialType, type Prisma } from '@prisma/client';
import { nanoid } from 'nanoid';

export function createToken<
  PrismaQuery extends {
    include?: Prisma.CredentialInclude;
    select?: Prisma.CredentialSelect;
  },
>(query: PrismaQuery, userId: string, userAgent: string) {
  return prisma.credential.create({
    ...query,
    data: {
      userId,
      type: CredentialType.Token,
      value: nanoid(),
      userAgent,
      // Keep the token alive for a year
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  });
}
