import { builder, CapacityUnlimitedValue, ensureGlobalId, graphinx, log, prisma } from '#lib';
import {
  CapacityScalar,
  EventManagerInviteType,
  EventManagerPowerLevelType,
} from '#modules/events/types';
import {
  canEditManagers,
  canEditManagersPrismaIncludes,
  powerlevelToPermissions,
} from '#modules/events/utils';
import { DateTimeScalar, LocalID } from '#modules/global';
import { GraphQLError } from 'graphql';
import { nanoid } from 'nanoid';

builder.mutationField('upsertEventManagerInvite', (t) =>
  t.prismaField({
    type: EventManagerInviteType,
    errors: {},
    description: "Créer ou modifier une invitation de manager d'évènement",
    args: {
      id: t.arg({
        type: LocalID,
        description: "Identifiant de l'invitation. Ne pas préciser pour en créer une nouvelle",
        required: false,
      }),
      event: t.arg({ type: LocalID, description: 'Évènement associé.', required: false }),
      input: t.arg({
        type: builder.inputType('EventManagerInviteInput', {
          ...graphinx('events'),
          fields: (t) => ({
            expiresAt: t.field({
              type: DateTimeScalar,
              required: false,
              description: "Date d'expiration. Si non précisée, expire à la fin de l'évènement",
            }),
            resetExpiresAt: t.boolean({
              defaultValue: false,
              description:
                "Pour une modification d'invitation existante, permet de mettre expiresAt à null",
            }),
            capacity: t.field({
              required: false,
              type: CapacityScalar,
              description: "Nombre maximal de personnes pouvant utiliser l'invitation",
            }),
            powerlevel: t.field({
              required: false,
              type: EventManagerPowerLevelType,
              description: "Niveau de permission accordé aux managers créés par l'invitation",
            }),
          }),
        }),
      }),
    },
    validate: [
      [({ id, event }) => Boolean(id || event), { message: 'Il faut préciser id ou event' }],
    ],
    async authScopes(_, { id, event: eventId }, { user }) {
      const event = await prisma.event.findFirst({
        where: eventId
          ? {
              id: ensureGlobalId(eventId, 'Event'),
            }
          : {
              managerInvites: { some: { id: ensureGlobalId(id!, 'EventManagerInvite') } },
            },
        include: canEditManagersPrismaIncludes,
      });
      if (!event) throw new GraphQLError('Évènement introuvable');
      return canEditManagers(event, user);
    },
    async resolve(query, _, { id, event, input }, { user }) {
      if (id) id = ensureGlobalId(id, 'EventManagerInvite');
      if (event) event = ensureGlobalId(event, 'Event');

      await log(
        'events',
        `manager-invite/${id ? 'update' : 'create'}`,
        { id, event, input },
        event,
        user,
      );

      if (id) {
        return prisma.eventManagerInvite.update({
          ...query,
          where: { id },
          data: {
            expiresAt: input.resetExpiresAt ? null : (input.expiresAt ?? undefined),
            capacity:
              input.capacity === null
                ? undefined
                : input.capacity === CapacityUnlimitedValue
                  ? null
                  : input.capacity,
            ...(input.powerlevel ? powerlevelToPermissions(input.powerlevel) : {}),
          },
        });
      }

      return prisma.eventManagerInvite.create({
        ...query,
        data: {
          eventId: event!,
          code: nanoid(6),
          expiresAt: input.expiresAt,
          capacity: input.capacity === CapacityUnlimitedValue ? null : input.capacity,
          ...(input.powerlevel ? powerlevelToPermissions(input.powerlevel) : {}),
        },
      });
    },
  }),
);
