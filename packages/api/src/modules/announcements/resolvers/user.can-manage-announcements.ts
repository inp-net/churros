import { builder } from '#lib';
import { UserType } from '#modules/users';

export function canManageAnnouncements(user: null | undefined | { admin: boolean }) {
  return Boolean(user?.admin);
}

builder.prismaObjectField(UserType, 'canManageAnnouncements', (t) =>
  t.boolean({
    description: 'Si cet·te utilisateur·rice peut créer, modifier ou supprimer des annonces',
    resolve: (user) => canManageAnnouncements(user),
  }),
);
