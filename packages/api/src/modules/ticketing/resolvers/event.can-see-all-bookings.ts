import { builder } from '#lib';
import { EventType } from '#modules/events';
import { canSeeAllBookings } from '#modules/ticketing/utils';
import { GraphQLError } from 'graphql';

builder.prismaObjectField(EventType, 'canSeeAllBookings', (t) =>
  t.boolean({
    description:
      "L'utilisateur·ice connecté·e peut voir la liste des réservations de cet évènement",
    args: {
      assert: t.arg.string({
        required: false,
        description:
          "Lève une erreur si l'utilisateur·ice n'a pas les permissions, au lieu de juste renvoyer `false`. La valeur est le message d'erreur à renvoyer",
      }),
    },
    async resolve(event, { assert }, { user }) {
      if (canSeeAllBookings(event, user)) return true;
      if (assert) throw new GraphQLError(assert);
      return false;
    },
  }),
);
