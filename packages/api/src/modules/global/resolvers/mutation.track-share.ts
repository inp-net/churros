import { builder, prisma, splitID } from '#lib';
import { GraphQLError } from 'graphql';

builder.mutationField('trackShare', (t) =>
  t.boolean({
    description: "Marque une ressource comme partagée par l'utilisateur·ice connecté·e",
    args: {
      resource: t.arg.id({
        description: 'ID (global) de la ressource',
      }),
    },
    authScopes: {
      loggedIn: true,
    },
    async resolve(_, { resource: id }, { user }) {
      if (!user) return false;
      switch (splitID(id)[0]) {
        case 'Event': {
          await prisma.event.update({
            where: { id },
            data: {
              sharedBy: {
                connect: { id: user.id },
              },
            },
          });
          break;
        }
        case 'Article': {
          await prisma.article.update({
            where: { id },
            data: {
              sharedBy: {
                connect: { id: user.id },
              },
            },
          });
          break;
        }
        default: {
          throw new GraphQLError(
            `Les ressources de type ${splitID(id)[0]} ne peuvent pas être marquées comme partagées`,
          );
        }
      }
      return true;
    },
  }),
);
