import { builder, prisma } from '#lib';
import { EventManagerInviteType, EventManagerType } from '#modules/events/types';

builder.prismaObjectField(EventManagerType, 'usedInvite', (t) =>
  t.prismaField({
    type: EventManagerInviteType,
    nullable: true,
    description: "L'invitation utilisée par ce manager pour devenir manager de l'évènement.",
    async resolve(query, { eventId, userId }) {
      return prisma.eventManagerInvite.findFirst({
        ...query,
        where: {
          eventId,
          usedBy: {
            some: {
              id: userId,
            },
          },
        },
      });
    },
  }),
);
