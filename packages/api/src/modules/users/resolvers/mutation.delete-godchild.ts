import {log, builder, prisma } from '#lib';

builder.mutationField('deleteGodchild', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      parentUid: t.arg.string(),
      godchildUid: t.arg.string(),
    },
    async resolve(_, { parentUid, godchildUid }) {
      const parent = await prisma.user.findUniqueOrThrow({ where: { uid: parentUid } });
      const godchild = await prisma.user.findUniqueOrThrow({ where: { uid: godchildUid } });
      if (parent.godparentId !== godchild.id) return false;
      await prisma.user.update({
        where: {
          uid: godchildUid,
        },
        data: {
          godparent: { disconnect: true },
        },
      });
      await log('godparent', 'delete', { message: `Deleted godchild ${godchild.uid}` }, godchild.id, parent);
      return true;
    },
  }),
);
