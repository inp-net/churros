import { builder, ensureGlobalId, prisma } from '#lib';
import { EventManagerInviteType } from '#modules/events/types';

builder.queryField('eventManagerInvite', (t) =>
  t.prismaField({
    type: EventManagerInviteType,
    nullable: true,
    args: {
      idOrCode: t.arg.string({ description: "Indentifiant de l'invitation ou code d'invitation" }),
    },
    async resolve(query, _, { idOrCode }) {
      return prisma.eventManagerInvite.findFirst({
        ...query,
        where: {
          OR: [{ id: ensureGlobalId(idOrCode, 'EventManagerInvite') }, { code: idOrCode }],
        },
      });
    },
  }),
);
