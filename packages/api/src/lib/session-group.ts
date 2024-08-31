import type { Prisma } from '@churros/db/prisma';

export const SessionGroupPrismaIncludes = {
  studentAssociation: {
    include: {
      admins: true,
    },
  },
} as const satisfies Prisma.GroupInclude;

export type SessionGroup = Prisma.GroupGetPayload<{ include: typeof SessionGroupPrismaIncludes }>;
