import { builder, prisma } from '#lib';
import {} from '#modules/global';
import {} from '../index.js';
// TODO rename to all-third-party-apps

builder.queryField('allApps', (t) =>
  t.prismaField({
    description: 'Get all OAuth2 clients. Only admins can do this.',
    type: ['ThirdPartyApp'],
    authScopes: { admin: true },
    resolve: (query) => prisma.thirdPartyApp.findMany(query),
  }),
);
