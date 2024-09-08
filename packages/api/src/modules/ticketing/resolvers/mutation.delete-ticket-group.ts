import { builder, ensureGlobalId, prisma } from '#lib';
import { canEditEvent, canEditEventPrismaIncludes } from '#modules/events';
import { LocalID } from '#modules/global';
import { TicketGroupType } from '#modules/ticketing/types';

builder.mutationField('deleteTicketGroup', (t) =>
  t.prismaField({
    type: TicketGroupType,
    errors: {},
    args: {
      id: t.arg({ type: LocalID }),
    },
    async authScopes(_, { id }, { user }) {
      return canEditEvent(
        await prisma.ticketGroup
          .findUniqueOrThrow({
            where: { id: ensureGlobalId(id, 'TicketGroup') },
          })
          .event({
            include: canEditEventPrismaIncludes,
          }),
        user,
      );
    },
    async resolve(query, _, { id }) {
      return prisma.ticketGroup.delete({
        ...query,
        where: { id: ensureGlobalId(id, 'TicketGroup') },
      });
    },
  }),
);
