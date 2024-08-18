import { builder } from '#lib';

builder.queryField('loggedIn', (t) =>
  t.boolean({
    description: "Vrai si l'utilisateur·ice est connecté·e",
    resolve(_, __, { token }) {
      return Boolean(token);
    },
  }),
);
