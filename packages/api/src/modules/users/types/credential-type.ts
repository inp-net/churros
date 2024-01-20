import { builder } from '#lib';

import { CredentialType as PrismaCredentialType } from '@prisma/client';

export const CredentialEnumType = builder.enumType(PrismaCredentialType, {
  name: 'CredentialType',
});
