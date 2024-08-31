import { builder, log, prisma, purgeSessionsUser } from '#lib';
import { UIDScalar } from '#modules/global';
import { UserProfileInput, UserType } from '#modules/users/types';
import { canEditProfile } from '#modules/users/utils';
import { upsertLdapUser } from '@inp-net/ldap7/user';

builder.mutationField('updateUserProfile', (t) =>
  t.prismaField({
    type: UserType,
    errors: {},
    description: "Met à jour le profil de l'utilisateur",
    args: {
      uid: t.arg({ type: UIDScalar }),
      profile: t.arg({ type: UserProfileInput }),
    },
    async authScopes(_, { uid }, { user }) {
      const targetUser = await prisma.user.findUniqueOrThrow({
        where: { uid },
        include: canEditProfile.prismaIncludes,
      });
      return canEditProfile(user, targetUser);
    },
    async resolve(query, _, { uid, profile }, { user }) {
      await log('users', 'edit-profile', { uid, profile }, uid, user);
      await purgeSessionsUser(uid);
      const result = await prisma.user.update({
        ...query,
        where: { uid },
        data: {
          firstName: profile.firstName ?? undefined,
          lastName: profile.lastName ?? undefined,
          otherEmails: profile.otherEmails ? { set: profile.otherEmails } : undefined,
          birthday: profile.unsetBirthday ? null : (profile.birthday ?? undefined),
          address: profile.address ?? undefined,
          phone: profile.unsetPhone ? '' : (profile.phone ?? undefined),
          nickname: profile.nickname ?? undefined,
          description: profile.description ?? undefined,
        },
      });
      await upsertLdapUser({
        firstName: result.firstName,
        lastName: result.lastName,
        uid: result.uid,
        email: [result.email, ...result.otherEmails],
      }).catch(async (error) => {
        await log('ldap', 'update-user-profile', { uid, profile, error }, uid, user);
      });
      return result;
    },
  }),
);
