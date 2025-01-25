import { builder, ensureGlobalId, fullTextSearch, prisma } from '#lib';
import { EventType } from '#modules/events';
import {
  BookingStateEnum,
  bookingStatePrismaWhereClause,
  canSeeAllBookings,
  RegistrationSearchResultType,
} from '../index.js';

builder.prismaObjectField(EventType, 'searchBookings', (t) =>
  t.field({
    type: [RegistrationSearchResultType],
    args: {
      q: t.arg.string(),
      only: t.arg({
        type: BookingStateEnum,
        required: false,
        description: "Ne montre que les réservations d'un certain statut",
      }),
    },
    async authScopes(event, _, { user }) {
      return canSeeAllBookings(event, user);
    },
    async resolve({ id }, { q, only }) {
      // Try to find by code
      const byCode = await prisma.registration.findUnique({
        where: {
          id: ensureGlobalId(q.toLowerCase(), 'Registration'),
          ...bookingStatePrismaWhereClause(only),
        },
      });

      if (byCode) {
        return [
          {
            id: byCode.id,
            rank: 1,
            similarity: 1,
            highlights: {
              authorEmail: '',
              externalBeneficiary: '',
              authorFullName: '',
              internalBeneficiaryFullName: '',
            },
            registration: byCode,
            byCode: true,
          },
        ];
      }

      return fullTextSearch('Registration', q, {
        fuzzy: [
          'id',
          'authorEmail',
          'externalBeneficiary',
          'authorFullName',
          'internalBeneficiaryFullName',
        ],
        highlight: [
          'authorEmail',
          'externalBeneficiary',
          'authorFullName',
          'internalBeneficiaryFullName',
        ],
        htmlHighlights: [],
        property: 'registration',
        similarityCutoff: 0.01,
        resolveObjects: (ids) =>
          prisma.registration.findMany({
            where: {
              id: { in: [...ids] },
              ticket: { eventId: id },
            },
          }),
      });
    },
  }),
);
