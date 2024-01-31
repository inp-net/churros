import { builder } from '#lib';
import {} from '#modules/global';
import { CredentialType as PrismaCredentialType } from '@prisma/client';
import {} from '../index.js';

export const CredentialEnumType = builder.enumType(PrismaCredentialType, {
  name: 'CredentialType',
});
