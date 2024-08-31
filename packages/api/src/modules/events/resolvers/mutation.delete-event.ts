import { builder, ensureGlobalId, log, prisma } from '#lib';
import { EventType } from '#modules/events/types';
import { canEditEvent, canEditEventPrismaIncludes } from '#modules/events/utils';
import { LocalID } from '#modules/global';
import { Visibility } from '@churros/db/prisma';

// TODO soft delete instead
builder.mutationField('deleteEvent', (t) =>
  t.prismaField({
    type: EventType,
    errors: {
      types: [Error],
      result: {
        fields: (t) => ({
          didSoftDelete: t.string({
            nullable: true,
            description:
              "Indique que l'évènement n'a pas été supprimé mais plutôt passé en privé. La valeur est un message expliquant cela, et pourquoi c'est arrivé.",
            resolve: (_, __, { caveats }) => caveats.at(0) || null,
          }),
        }),
      },
    },
    args: {
      id: t.arg({ type: LocalID }),
    },
    async authScopes(_, { id }, { user }) {
      const event = await prisma.event.findUniqueOrThrow({
        where: { id: ensureGlobalId(id, 'Event') },
        include: canEditEventPrismaIncludes,
      });
      return canEditEvent(event, user);
    },
    async resolve(query, _, { id }, ctx) {
      const { user } = ctx;
      id = ensureGlobalId(id, 'Event');
      const associatedBookings = await prisma.registration.count({
        where: { ticket: { eventId: id } },
      });
      if (associatedBookings > 0) {
        ctx.caveats.unshift(
          "Impossible de supprimer un évènement qui possède des réservations. L'évènement a été passé en Privé",
        );
        return prisma.event.update({
          ...query,
          where: { id },
          data: {
            visibility: Visibility.Private,
          },
        });
      }
      const event = await prisma.event.delete({
        ...query,
        where: { id },
      });
      await log('event', 'delete', { message: `Deleted event ${id}`, event }, id, user);
      return event;
    },
  }),
);
