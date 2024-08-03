import { builder, ensureGlobalId, log, prisma } from '#lib';
import { EventType } from '#modules/events/types';
import { canEditEvent, canEditEventPrismaIncludes } from '#modules/events/utils';
import { LocalID, VisibilityEnum } from '#modules/global';
import { Visibility } from '@churros/db/prisma';
import { ZodError } from 'zod';

const ALLOWED_DATELESS_VISIBILITIES = [Visibility.Private, Visibility.Unlisted] as Visibility[];

builder.mutationField('setEventVisibility', (t) =>
  t.prismaField({
    type: EventType,
    errors: { types: [Error, ZodError] },
    description:
      "Changer la visibilité d'un événement. Un évènement dont les dates ne sont pas encore déclarées ne peut pas avoir une visiblité autre que Unlisted ou Private.",
    args: {
      id: t.arg({ type: LocalID }),
      visibility: t.arg({ type: VisibilityEnum }),
    },
    async authScopes(_, { id, visibility }, { user }) {
      const event = await prisma.event.findUniqueOrThrow({
        where: { id: ensureGlobalId(id, 'Event') },
        include: canEditEventPrismaIncludes,
      });
      if ((!event.startsAt || !event.endsAt) && !ALLOWED_DATELESS_VISIBILITIES.includes(visibility))
        return false;

      return canEditEvent(event, user);
    },
    async resolve(query, _, { id, visibility }, { user }) {
      id = ensureGlobalId(id, 'Event');
      await log('events', 'set-visibility', { visibility, id }, id, user);
      return prisma.event.update({
        ...query,
        where: { id },
        data: {
          visibility,
        },
      });
    },
  }),
);
