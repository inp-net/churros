import { builder, ENV, prisma, purgeSessionsUser, UnauthorizedError } from '#lib';
import { UserType } from '#modules/users/types';
import { deleteLdapUser } from '@inp-net/ldap7/user';

builder.mutationField('deleteUser', (t) =>
  t.prismaField({
    type: UserType,
    description: 'Supprimer son compte',
    errors: {},
    async resolve(query, _, __, { user }) {
      if (!user) throw new UnauthorizedError();
      return await prisma.$transaction(async (tx) => {
        const result = await tx.user.delete({
          ...query,
          where: { id: user.id },
        });
        await purgeSessionsUser(user.uid);
        if (process.env['NODE_ENV'] !== 'development') await deleteLdapUser(user.uid);
        if (ENV.USER_DELETED_WEBHOOK) {
          const url = new URL(ENV.USER_DELETED_WEBHOOK);
          url.searchParams.append('user', user.uid);
          await fetch(url.toString());
        }
        return result;
      });
    },
  }),
);
