import { builder } from '#lib';

export const NotificationSubscriptionType = builder.prismaObject('NotificationSubscription', {
  fields: (t) => ({
    id: t.exposeID('id'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    expiresAt: t.expose('expiresAt', { type: 'DateTime', nullable: true }),
    endpoint: t.exposeString('endpoint'),
    ownerId: t.exposeID('ownerId'),
    owner: t.relation('owner'),
    name: t.exposeString('name'),
  }),
});
