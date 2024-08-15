import { builder, ensureGlobalId, prisma } from '#lib';
import { LocalID } from '#modules/global';
import { QuickSignupType } from '#modules/users/types';

builder.queryField('quickSignup', (t) =>
  t.prismaField({
    type: QuickSignupType,
    description: "Récupérer des informations sur un lien d'inscription rapide",
    authScopes: () => true,
    args: {
      id: t.arg({
        type: LocalID,
        description: "Identifiant de l'inscription rapide. Si null, renvoie null",
      }),
    },
    async resolve(query, _, args) {
      return prisma.quickSignup.findUniqueOrThrow({
        ...query,
        where: {
          id: ensureGlobalId(args.id, 'QuickSignup'),
        },
      });
    },
  }),
);
