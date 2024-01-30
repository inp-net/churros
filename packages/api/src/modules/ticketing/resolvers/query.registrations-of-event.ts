import { builder, prisma } from '#lib';

import { RegistrationType } from '../index.js';
// TODO rename to event.bookings

builder.queryField('registrationsOfEvent', (t) =>
  t.prismaConnection({
    type: RegistrationType,
    cursor: 'id',
    args: {
      groupUid: t.arg.string(),
      eventUid: t.arg.string(),
    },
    async subscribe(subscriptions, _, { groupUid, eventUid }) {
      const { id } = await prisma.event.findFirstOrThrow({
        where: { uid: eventUid, group: { uid: groupUid } },
      });

      subscriptions.register(id);
    },
    async authScopes(_, { eventUid, groupUid }, { user }) {
      const { managers } = await prisma.event.findFirstOrThrow({
        where: { uid: eventUid, group: { uid: groupUid } },
        include: { managers: true },
      });
      return Boolean(user?.admin || managers.some(({ userId }) => user?.id === userId));
    },
    async resolve(query, _, { eventUid, groupUid }) {
      return prisma.registration.findMany({
        ...query,
        where: { ticket: { event: { uid: eventUid, group: { uid: groupUid } } } },
        orderBy: { createdAt: 'desc' },
      });
    },
  }),
);
