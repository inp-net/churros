import { builder } from '#lib';

import { CredentialType as PrismaCredentialType } from '@centraverse/db/prisma';

export const CredentialEnumType = builder.enumType(PrismaCredentialType, {
  name: 'CredentialType',
});
