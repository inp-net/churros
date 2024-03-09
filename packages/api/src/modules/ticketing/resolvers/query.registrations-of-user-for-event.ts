import { builder, prisma } from '#lib';

import { userCanManageEvent } from '#permissions';
import { RegistrationType } from '../index.js';
// TODO rename to user.bookings-for-event; and also create a query event.bookings-of-user
// maybe there's a better way to do this kind of "triple coupling", idk.
// sth like user.(sth like "participant-of", user.events could be amibiguous with user.managed-events).bookings

builder.queryField('registrationsOfUserForEvent', (t) =>
  t.prismaField({
    type: [RegistrationType],
    errors: {},
    args: {
      groupUid: t.arg.string(),
      eventUid: t.arg.string(),
      userUid: t.arg.string(),
    },
    async authScopes(_, { eventUid, userUid, groupUid }, { user }) {
      if (!user) return false;
      if (user.uid === userUid) return true;
      const group = await prisma.group.findUnique({ where: { uid: groupUid } });
      if (!group) return false;
      const event = await prisma.event.findUnique({
        where: { groupId_uid: { groupId: group.id, uid: eventUid } },
        include: {
          managers: {
            include: {
              user: true,
            },
          },
        },
      });
      if (!event) return false;
      return userCanManageEvent(event, user, { canVerifyRegistrations: true });
    },
    async resolve(query, _, { eventUid, groupUid, userUid }, {}) {
      const user = await prisma.user.findUniqueOrThrow({ where: { uid: userUid } });
      return prisma.registration.findMany({
        ...query,
        where: {
          ticket: {
            event: {
              uid: eventUid,
              group: {
                uid: groupUid,
              },
            },
          },
          OR: [
            {
              author: {
                uid: userUid,
              },
            },
            {
              beneficiary: userUid,
            },
            { authorEmail: user.email },
          ],
        },
      });
    },
  }),
);
