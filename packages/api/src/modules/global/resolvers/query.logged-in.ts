import { builder } from '#lib';
import { GraphQLError } from 'graphql';

builder.queryField('loggedIn', (t) =>
  t.boolean({
    description: "Vrai si l'utilisateur·ice est connecté·e",
    args: {
      assert: t.arg.string({
        description: 'Si renseigné, renvoie une erreur si l’utilisateur·ice n’est pas connecté·e',
        required: false,
      }),
    },
    resolve(_, { assert }, { user }) {
      if (assert && !user) throw new GraphQLError(assert);
      return Boolean(user);
    },
  }),
);
