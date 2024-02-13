import { builder, fullTextSearch, prisma } from '#lib';

import { userCanManageEvent } from '#permissions';
import { RegistrationSearchResultType } from '../index.js';
// TODO rename to event.search-bookings

builder.queryField('searchRegistrations', (t) =>
  t.field({
    type: [RegistrationSearchResultType],
    args: {
      groupUid: t.arg.string(),
      eventUid: t.arg.string(),
      q: t.arg.string(),
    },
    async authScopes(_, { eventUid, groupUid }, { user }) {
      const event = await prisma.event.findFirstOrThrow({
        where: {
          group: { uid: groupUid },
          uid: eventUid,
        },
        include: {
          managers: { include: { user: true } },
        },
      });
      return userCanManageEvent(event, user, {});
    },
    async resolve(_, { q, eventUid, groupUid }) {
      return fullTextSearch('Registration', q, {
        fuzzy: ['beneficiary'],
        highlight: ['beneficiary'],
        htmlHighlights: [],
        property: 'registration',
        resolveObjects: (ids) =>
          prisma.registration.findMany({
            where: {
              id: { in: ids },
              ticket: { event: { uid: eventUid, group: { uid: groupUid } } },
            },
          }),
      });
    },
  }),
);
