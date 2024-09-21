import { builder, graphinx, log, prisma } from '#lib';
import { UIDScalar } from '#modules/global';
import { GroupType } from '#modules/groups/types';
import { canSetGroupJoinPolicy } from '#modules/groups/utils';

builder.mutationField('setGroupJoinPolicy', (t) =>
  t.prismaField({
    type: GroupType,
    errors: {},
    description: "Définir comment l'on peut rejoindre un groupe",
    args: {
      uid: t.arg({ type: UIDScalar }),
      policy: t.arg({
        type: builder.enumType('GroupJoinPolicy', {
          ...graphinx('groups'),
          values: {
            Open: { value: 'Open', description: 'Tout le monde peut rejoindre le groupe' },
            Closed: {
              value: 'Closed',
              description:
                'Seul le bureau (et autres ayant les permissions) peut ajouter des membres',
            },
          },
        }),
      }),
    },
    async authScopes(_, { uid }, { user }) {
      return canSetGroupJoinPolicy(
        user,
        await prisma.group.findUniqueOrThrow({
          where: { uid },
          include: canSetGroupJoinPolicy.prismaIncludes,
        }),
      );
    },
    async resolve(query, _, { uid, policy }, { user }) {
      await log('groups', 'set-join-policy', { uid, policy }, uid, user);
      return prisma.group.update({
        ...query,
        where: { uid },
        data: {
          selfJoinable: policy === 'Open',
        },
      });
    },
  }),
);
