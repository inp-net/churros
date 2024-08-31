import { builder, log, prisma } from '#lib';
import { UIDScalar } from '#modules/global';
import { UserType } from '#modules/users/types';

builder.mutationField('deleteGodparent', (t) =>
  t.prismaField({
    type: UserType,
    errors: {},
    description:
      'Supprime le parrain ou la marraine, que ce soit une demande de parrainage en cours ou simplement un·e parrain/marraine existant·e. Renvoie lea fillo·t·e',
    args: {
      child: t.arg({ type: UIDScalar }),
      parent: t.arg({ type: UIDScalar }),
    },
    async authScopes(_, { child: childUid }, { user }) {
      return Boolean(user?.admin || user?.uid === childUid);
    },
    async resolve(query, _, args, { user }) {
      await log('godparents', 'delete', args, args.parent, user);
      await prisma.godparentRequest.deleteMany({
        where: {
          OR: [{ godparent: { uid: args.child }, godchild: { uid: args.parent } }],
        },
      });
      return prisma.user.update({
        ...query,
        where: {
          uid: args.child,
        },
        data: {
          godparent: { disconnect: true },
        },
      });
    },
  }),
);
