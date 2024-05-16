import { builder, prisma } from '#lib';
import { RegistrationType } from '#modules/ticketing';
import { canSeeBookings } from '../index.js';
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
      const event = await prisma.event.findFirst({
        where: { uid: eventUid, group: { uid: groupUid } },
        include: { managers: true, group: true },
      });
      if (!event) return false;
      return canSeeBookings(event, user);
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
