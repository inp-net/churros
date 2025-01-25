import { builder, ensureGlobalId, log, prisma } from '#lib';
import { LocalID } from '#modules/global';
import { canEditLydiaAccounts } from '#modules/groups';
import { LydiaAccountType } from '#modules/payments/types';
import { GraphQLError } from 'graphql';

builder.mutationField('deleteLydiaAccount', (t) =>
  t.prismaField({
    type: LydiaAccountType,
    errors: {},
    description:
      "Supprimer l'enregistrement d'uncompte Lydia sur un groupe (ne supprime pas le compte Lydia Pro sur Lydia)",
    args: {
      id: t.arg({ type: LocalID }),
    },
    async authScopes(_, { id }, { user }) {
      const group = await prisma.lydiaAccount
        .findUniqueOrThrow({ where: { id: ensureGlobalId(id, 'LydiaAccount') } })
        .group({ include: canEditLydiaAccounts.prismaIncludes });

      if (!group) throw new GraphQLError("Ce compte Lydia n'est relié à aucun groupe");

      return canEditLydiaAccounts(user, group);
    },
    async resolve(query, _, { id }, { user }) {
      const result = await prisma.lydiaAccount.delete({
        ...query,
        where: { id: ensureGlobalId(id, 'LydiaAccount') },
      });
      await log('lydia-accounts', 'deleted', { account: result }, result.id, user);
      return result;
    },
  }),
);
