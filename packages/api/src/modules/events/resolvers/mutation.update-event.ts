import { builder, ensureGlobalId, log, nullToUndefined, prisma } from '#lib';
import { EventFrequencyType, EventType } from '#modules/events/types';
import { canEditEvent, canEditEventPrismaIncludes } from '#modules/events/utils';
import { DateRangeInput, LocalID } from '#modules/global';
import { EventFrequency } from '@churros/db/prisma';
import omit from 'lodash.omit';
import { MarkdownScalar } from '../../global/types/markdown.js';

builder.mutationField('updateEvent', (t) =>
  t.prismaField({
    type: EventType,
    description: "Mettre à jour les informations de base d'un évènement",
    args: {
      id: t.arg({ type: LocalID }),
      title: t.arg.string({
        required: false,
        description: "Titre de l'évènement",
        validate: {
          minLength: 1,
          maxLength: 255,
        },
      }),
      dates: t.arg({ required: false, type: DateRangeInput, description: "Dates de l'évènement" }),
      frequency: t.arg({
        required: false,
        type: EventFrequencyType,
        defaultValue: EventFrequency.Once,
      }),
      location: t.arg.string({ required: false, description: "Lieu de l'évènement" }),
      description: t.arg({ required: false, type: MarkdownScalar }),
      showPlacesLeft: t.arg.boolean({
        required: false,
        description: 'Afficher le nombre de places restantes sur les billets',
        defaultValue: true,
      }),
    },
    async authScopes(_, args, { user }) {
      const event = await prisma.event.findUniqueOrThrow({
        where: { id: ensureGlobalId(args.id, 'Event') },
        include: canEditEventPrismaIncludes,
      });
      return canEditEvent(event, user);
    },
    async resolve(query, _, args, { user }) {
      const id = ensureGlobalId(args.id, 'Event');
      await log('events', 'update', { args }, id, user);
      return prisma.event.update({
        ...query,
        where: { id },
        data: {
          ...nullToUndefined(omit(args, 'dates', 'id')),
          startsAt: args.dates?.start ?? undefined,
          endsAt: args.dates?.end ?? undefined,
        },
      });
    },
  }),
);
