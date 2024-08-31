import { builder, log, prisma, purgeSessionsUser } from '#lib';
import { PositiveInt, UIDScalar } from '#modules/global';
import { UserType } from '#modules/users/types';
import { canEditProfile } from '#modules/users/utils';
import { deleteLdapUser, upsertLdapUser } from '@inp-net/ldap7/user';

builder.mutationField('updateUserCurriculum', (t) =>
  t.prismaField({
    type: UserType,
    errors: {},
    description: "Met à jour les infos sur le cursus scolaire de l'utilisateur.ice",
    args: {
      uid: t.arg({ type: UIDScalar }),
      major: t.arg({ type: UIDScalar, required: false }),
      graduationYear: t.arg({ type: PositiveInt, required: false }),
      external: t.arg.boolean({
        required: false,
        description:
          'Vrai pour déconnecter la personne de sa filière (et donc faire du compte un compte exté)',
      }),
      apprentice: t.arg.boolean({ required: false }),
    },
    async authScopes(_, { uid }, { user }) {
      const targetUser = await prisma.user.findUniqueOrThrow({
        where: { uid },
        include: canEditProfile.prismaIncludes,
      });
      return canEditProfile(user, targetUser);
    },
    async resolve(query, _, args, { user }) {
      await log('users', 'edit-curriculum', args, args.uid, user);
      await purgeSessionsUser(args.uid);
      const result = await prisma.user.update({
        include: { major: { include: { schools: true } } },
        where: { uid: args.uid },
        data: {
          major: args.external
            ? { disconnect: true }
            : args.major
              ? { connect: { uid: args.major } }
              : undefined,
          graduationYear: args.graduationYear ?? undefined,
          apprentice: args.apprentice ?? undefined,
        },
      });

      // Unicorn est completement taré jvais pas faire un ternaire de ça wtf
      // eslint-disable-next-line unicorn/prefer-ternary
      if (result.major) {
        await upsertLdapUser({
          uid: result.uid,
          school: result.major.schools.map((s) => s.uid),
          firstName: result.firstName,
          lastName: result.lastName,
          email: [result.email, ...result.otherEmails],
        }).catch(async (error) => {
          await log(
            'ldap',
            'update-user-curriculum/set/fail',
            { uid: args.uid, args, error },
            args.uid,
            user,
          );
        });
      } else {
        // @legmask: pas sûr de si il faut le faire ou pas
        await deleteLdapUser(result.uid).catch(async (error) => {
          await log(
            'ldap',
            'update-user-curriculum/delete-user/fail',
            { uid: args.uid, args, error },
            args.uid,
            user,
          );
        });
      }

      // TODO return from prisma.update call directly once pothos has query-object merging
      return prisma.user.findUniqueOrThrow({
        ...query,
        where: { uid: args.uid },
      });
    },
  }),
);
