import { builder } from '#lib';
import { DateTimeScalar } from '#modules/global';
import { NotificationChannel } from '../index.js';

export const NotificationType = builder.prismaNode('Notification', {
  id: { field: 'id' },
  fields: (t) => ({
    createdAt: t.expose('createdAt', { type: DateTimeScalar }),
    updatedAt: t.expose('updatedAt', { type: DateTimeScalar }),
    timestamp: t.expose('timestamp', { type: DateTimeScalar, nullable: true }),
    groupId: t.exposeID('groupId', { nullable: true }),
    group: t.relation('group', { nullable: true }),
    subscriptionId: t.exposeID('subscriptionId'),
    subscription: t.relation('subscription'),
    vibrate: t.expose('vibrate', { type: ['Int'] }),
    body: t.exposeString('body'),
    title: t.exposeString('title'),
    imageFile: t.exposeString('imageFile'),
    channel: t.expose('channel', { type: NotificationChannel }),
    actions: t.relation('actions'),
    goto: t.exposeString('goto'),
  }),
});
