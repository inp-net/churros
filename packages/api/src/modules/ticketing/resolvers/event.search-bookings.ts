import { builder, fullTextSearch, prisma } from '#lib';
import { EventType } from '#modules/events';
import { canSeeAllBookings, RegistrationSearchResultType } from '../index.js';

builder.prismaObjectField(EventType, 'searchBookings', (t) =>
  t.field({
    type: [RegistrationSearchResultType],
    args: {
      q: t.arg.string(),
    },
    async authScopes(event, _, { user }) {
      return canSeeAllBookings(event, user);
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
