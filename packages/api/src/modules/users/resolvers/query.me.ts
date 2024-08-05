import { builder } from '#lib';

import { UserType } from '../index.js';

/** Returns the current user. */
builder.queryField('me', (t) =>
  t.prismaField({
    description:
      'Renvoie l’utilisateur·ice connecté·e, ou null. Pour une valeur de retour non-nullable, voir `assertMe`.',
    directives: {
      rateLimit: { duration: 60, limit: 6000 },
    },
    type: UserType,
    nullable: true,
    resolve: (_query, _, {}, { user }) => user,
  }),
);
