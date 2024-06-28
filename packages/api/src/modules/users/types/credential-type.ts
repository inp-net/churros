import { builder } from '#lib';

import { CredentialType as PrismaCredentialType } from '@churros/db/prisma';

export const CredentialEnumType = builder.enumType(PrismaCredentialType, {
  name: 'CredentialType',
});
