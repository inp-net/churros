import { prisma } from '#lib';
import { CredentialType, type Credential } from '@churros/db/prisma';
import { SessionGroupPrismaIncludes, type SessionGroup } from './session-group.js';

export async function getGATSession(token: Credential['value']): Promise<SessionGroup | null> {
  const credential = await prisma.credential.findFirst({
    where: { type: CredentialType.GroupAccessToken, value: token },
    include: {
      group: { include: SessionGroupPrismaIncludes },
    },
  });

  return credential?.group ?? null;
}
