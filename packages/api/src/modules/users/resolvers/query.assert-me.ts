import { builder } from '#lib';
import { GraphQLError } from 'graphql';

import { UserType } from '../index.js';

builder.queryField('assertMe', (t) =>
  t.prismaField({
    description:
      "Renvoie l'utilisateur·ice connecté·e. Si l'utilisateur·ice n'est pas connecté·e, une erreur est renvoyée. Pour avoir null aulieu d'une erreur, voir `me`.",
    directives: {
      rateLimit: { duration: 60, limit: 6000 },
    },
    type: UserType,
    resolve: (_query, _, {}, { user }) => {
      if (!user) throw new GraphQLError('Il faut être connecté·e');
      return user;
    },
  }),
);
