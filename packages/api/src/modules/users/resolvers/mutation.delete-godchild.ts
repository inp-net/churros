import { builder, log, prisma } from '#lib';
import { UIDScalar } from '#modules/global';
import { UserType } from '#modules/users/types';

builder.mutationField('deleteGodchild', (t) =>
  t.prismaField({
    type: UserType,
    errors: {},
    args: {
      parent: t.arg({ type: UIDScalar }),
      child: t.arg({ type: UIDScalar }),
    },
    async resolve(query, _, { parent: parentUid, child: godchildUid }) {
      const parent = await prisma.user.findUniqueOrThrow({ where: { uid: parentUid } });
      const godchild = await prisma.user.findUniqueOrThrow({ where: { uid: godchildUid } });
      await log(
        'godparent',
        'delete',
        { message: `Deleted godchild ${godchild.uid}` },
        godchild.id,
        parent,
      );
      return prisma.user.update({
        ...query,
        where: {
          uid: godchildUid,
        },
        data: {
          godparent: { disconnect: true },
        },
      });
    },
  }),
);
