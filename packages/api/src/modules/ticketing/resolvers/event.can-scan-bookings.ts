import { builder } from '#lib';
import { EventType } from '#modules/events';
import { canScanBookings } from '#modules/ticketing/utils';

builder.prismaObjectField(EventType, 'canScanBookings', (t) =>
  t.boolean({
    description: "L'utilisateur·ice connecté·e peut scanner les réservations de cet évènement",
    resolve: (event, _, { user }) => canScanBookings(event, user),
  }),
);
