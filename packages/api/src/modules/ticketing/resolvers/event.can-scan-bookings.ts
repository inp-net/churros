import { builder } from '#lib';
import { EventType } from '#modules/events';
import { canScanBookings } from '#modules/ticketing/utils';
import { GraphQLError } from 'graphql';

builder.prismaObjectField(EventType, 'canScanBookings', (t) =>
  t.boolean({
    description: "L'utilisateur·ice connecté·e peut scanner les réservations de cet évènement",
    args: {
      assert: t.arg.string({
        required: false,
        description:
          "Erreur à lever si jamais la permission n'est pas donnée à l'utilisateur.ice connecté.e",
      }),
    },
    resolve: (event, { assert }, { user }) => {
      const can = canScanBookings(event, user);
      if (assert && !can) throw new GraphQLError(assert);
      return can;
    },
  }),
);
