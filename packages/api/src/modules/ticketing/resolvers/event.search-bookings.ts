import { builder, fullTextSearch, prisma } from '#lib';
import { canSeeBookings, RegistrationSearchResultType } from '../index.js';
import { EventType } from '#modules/events';

builder.prismaObjectField(EventType, 'searchBookings', (t) =>
  t.field({
    type: [RegistrationSearchResultType],
    args: {
      q: t.arg.string(),
    },
    async authScopes(event, _, { user }) {
      return canSeeBookings(event, user);
    },
    async resolve({ id }, { q }) {
      return fullTextSearch('Registration', q, {
        fuzzy: ['beneficiary'],
        highlight: ['beneficiary'],
        htmlHighlights: [],
        property: 'registration',
        resolveObjects: (ids) =>
          prisma.registration.findMany({
            where: {
              id: { in: ids },
              ticket: { eventId: id },
            },
          }),
      });
    },
  }),
);
