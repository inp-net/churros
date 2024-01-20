import { builder } from '#lib';
import { DateTimeScalar } from '#modules/global';
import * as PrismaTypes from '@prisma/client';
import { CredentialEnumType } from '../index.js';
// TODO rename to Token (password are not exposed in the API anyway)

export const CredentialType = builder.prismaObject('Credential', {
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    // userId: t.exposeID('userId'),
    type: t.expose('type', { type: CredentialEnumType }),
    token: t.exposeString('value', { authScopes: { $granted: 'login' } }),
    userAgent: t.exposeString('userAgent'),
    createdAt: t.expose('createdAt', { type: DateTimeScalar }),
    expiresAt: t.expose('expiresAt', { type: DateTimeScalar, nullable: true }),
    active: t.boolean({
      resolve: ({ type, value }, _, { token }) =>
        type === PrismaTypes.CredentialType.Token && value === token,
    }),
    user: t.relation('user', { grantScopes: ['me'] }),
  }),
});
