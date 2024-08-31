import { builder, ensureGlobalId, prisma } from '#lib';
import { EventFrequencyType, EventType } from '#modules/events/types';
import { canEditEvent, canEditEventPrismaIncludes } from '#modules/events/utils';
import { DateTimeScalar, LocalID } from '#modules/global';
import { EventFrequency } from '@churros/db/prisma';
import { ZodError } from 'zod';

builder.mutationField('updateEventRecurrence', (t) =>
  t.prismaField({
    type: EventType,
    errors: { types: [Error, ZodError] },
    description: "Changer les caractéristiques de récurrence d'un évènement",
    args: {
      id: t.arg({
        type: LocalID,
        description: "Identifiant de l'évènement",
      }),
      frequency: t.arg({
        type: EventFrequencyType,
        defaultValue: EventFrequency.Once,
        description: "Fréquence de récurrence de l'évènement",
      }),
      recurringUntil: t.arg({
        required: false,
        type: DateTimeScalar,
        description:
          'Date de fin de la récurrence. Si non précisé, ne modifie pas la date. Il faut passer `frequency` à `Once` pour supprimer la date de fin de récurrence',
      }),
    },
    validate: [
      [
        ({ frequency, recurringUntil }) => !(frequency === EventFrequency.Once && recurringUntil),
        {
          message: 'Un évènement sans récurrence ne peut avoir de date de fin de récurrence',
        },
      ],
    ],
    async authScopes(_, { id }, { user }) {
      const event = await prisma.event.findUniqueOrThrow({
        where: { id: ensureGlobalId(id, 'Event') },
        include: canEditEventPrismaIncludes,
      });
      return canEditEvent(event, user);
    },
    async resolve(query, _, { id, frequency, recurringUntil }) {
      return prisma.event.update({
        ...query,
        where: { id: ensureGlobalId(id, 'Event') },
        data: {
          frequency,
          recurringUntil: frequency === EventFrequency.Once ? null : (recurringUntil ?? undefined),
        },
      });
    },
  }),
);
