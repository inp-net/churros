import { builder, ensureGlobalId, log, nullToUndefined, prisma } from '#lib';
import { EventFrequencyType, EventType } from '#modules/events/types';
import { canEditEvent, canEditEventPrismaIncludes } from '#modules/events/utils';
import { LocalID } from '#modules/global';
import { EventFrequency } from '@churros/db/prisma';
import omit from 'lodash.omit';
import { ZodError } from 'zod';
import { MarkdownScalar } from '../../global/types/markdown.js';
import { CapacityScalar } from '../types/capacity.js';

builder.mutationField('updateEvent', (t) =>
  t.prismaField({
    type: EventType,
    errors: { types: [Error, ZodError] },
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
      globalCapacity: t.arg({
        type: CapacityScalar,
        required: false,
        description: "Capacité globale de l'évènement",
      }),
      contactMail: t.arg.string({
        required: false,
        description: "E-mail de contact de l'orga de l'évènement",
      }),
      includeInKiosk: t.arg.boolean({
        required: false,
        description: "Vrai si l'évènement doit apparaître dans le mode kiosque",
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
      const regularArgs = nullToUndefined(omit(args, 'dates', 'id', 'globalCapacity'));
      return prisma.event.update({
        ...query,
        where: { id },
        data: {
          ...regularArgs,
          globalCapacity:
            args.globalCapacity === 'Unlimited' ? null : args.globalCapacity ?? undefined,
        },
      });
    },
  }),
);
