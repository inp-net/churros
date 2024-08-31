import { builder, log, prisma } from '#lib';
import { UIDScalar } from '#modules/global';
import { GroupEnumType, GroupType } from '#modules/groups/types';
import { canChangeGroupType } from '#modules/groups/utils';

builder.mutationField('setGroupType', (t) =>
  t.prismaField({
    type: GroupType,
    errors: {},
    description: "Changer le type d'un groupe",
    args: {
      uid: t.arg({ type: UIDScalar }),
      type: t.arg({ type: GroupEnumType, required: false }),
      unlisted: t.arg.boolean({
        required: false,
        description: 'Si le groupe doit être caché des listes de groupes',
      }),
    },
    validate: [
      [
        ({ type, unlisted }) => !(type === undefined && unlisted === undefined),
        { message: 'Vous devez spécifier au moins le type ou le statut non répertorié du groupe' },
      ],
    ],
    async authScopes(_, { uid }, { user }) {
      return canChangeGroupType(
        user,
        await prisma.group.findUniqueOrThrow({
          where: { uid },
          include: canChangeGroupType.prismaIncludes,
        }),
      );
    },
    async resolve(query, _, { uid, type, unlisted }, { user }) {
      await log('groups', 'set-type-and-unlisted', { uid, type, unlisted }, uid, user);
      return prisma.group.update({
        ...query,
        where: { uid },
        data: { type: type ?? undefined, unlisted: unlisted ?? undefined },
      });
    },
  }),
);
