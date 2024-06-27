import { builder, toHtml, UnauthorizedError } from '#lib';

builder.queryField('renderMarkdown', (t) =>
  t.string({
    description: 'Rendu de markdown en HTML. Demande a être authentifié·e pour éviter tout abus.',
    args: {
      markdown: t.arg.string({
        description: 'Le markdown à rendre en HTML',
      }),
    },
    authScopes: { loggedIn: true },
    resolve: async (_, { markdown }, { user }) => {
      if (!user) throw new UnauthorizedError();
      return toHtml(markdown);
    },
  }),
);
