import { builder, ENV, log, prisma, purgeSessionsUser, UnauthorizedError } from '#lib';
import { UserType } from '#modules/users/types';
import { deleteLdapUser } from '@inp-net/ldap7/user';
import { GraphQLError } from 'graphql';

builder.mutationField('deleteUser', (t) =>
  t.prismaField({
    type: UserType,
    description: 'Supprimer son compte',
    errors: {},
    async resolve(query, _, __, { user }) {
      if (!user) throw new UnauthorizedError();
      await log('users', 'delete', { user }, user.id, user);
      return await prisma.$transaction(async (tx) => {
        const result = await tx.user.delete({
          ...query,
          where: { id: user.id },
        });
        await purgeSessionsUser(user.uid);
        if (process.env['NODE_ENV'] !== 'development') await deleteLdapUser(user.uid);
        if (ENV.USER_DELETED_WEBHOOK) {
          try {
            const url = new URL(ENV.USER_DELETED_WEBHOOK);
            url.searchParams.append('user', user.uid);
            await log(
              'users',
              'delete/webhook',
              { user: user.uid, url: url.toString() },
              user.id,
              user,
            );
            await fetch(url.toString());
          } catch (error) {
            await log(
              'users',
              'delete/webhook/failed',
              { error: error?.toString() },
              user.id,
              user,
            );
            throw new GraphQLError(
              "Impossible de notifier la suppression aux autres services. Ton compte n'a pas été supprimé.",
            );
          }
        }
        return result;
      });
    },
  }),
);
