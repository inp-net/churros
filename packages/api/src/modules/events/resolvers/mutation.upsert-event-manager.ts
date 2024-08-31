import { builder, ensureGlobalId, log, prisma, purgeSessionsUser } from '#lib';
import { EventManagerPowerLevelType, EventManagerType } from '#modules/events/types';
import {
  canEditManagers,
  canEditManagersPrismaIncludes,
  powerlevelToPermissions,
} from '#modules/events/utils';
import { LocalID, UIDScalar } from '#modules/global';
import { GraphQLError } from 'graphql';
import { ZodError } from 'zod';

builder.mutationField('upsertEventManager', (t) =>
  t.prismaField({
    type: EventManagerType,
    errors: { types: [Error, ZodError] },
    args: {
      event: t.arg({ type: LocalID }),
      user: t.arg({ type: UIDScalar }),
      powerlevel: t.arg({ type: EventManagerPowerLevelType }),
    },
    async authScopes(_, { event: eventId }, { user }) {
      const event = await prisma.event.findUniqueOrThrow({
        where: { id: ensureGlobalId(eventId, 'Event') },
        include: canEditManagersPrismaIncludes,
      });
      return canEditManagers(event, user);
    },
    async resolve(query, _, args, { user }) {
      const id = ensureGlobalId(args.event, 'Event');
      await log('events', 'upsert-event-manager', args, id, user);
      const { id: userId } = await prisma.user.findUniqueOrThrow({
        where: { uid: args.user },
        select: { id: true },
      });
      const managers = await prisma.eventManager.findMany({
        where: { eventId: id },
        select: { userId: true },
      });
      if (!managers.some((m) => m.userId === userId) && managers.length >= 50)
        throw new GraphQLError("Impossible d'avoir plus de 50 managers");

      await purgeSessionsUser(args.user);

      return prisma.eventManager.upsert({
        ...query,
        where: {
          eventId_userId: { eventId: id, userId },
        },
        create: {
          event: { connect: { id } },
          user: { connect: { id: userId } },
          ...powerlevelToPermissions(args.powerlevel),
        },
        update: {
          ...powerlevelToPermissions(args.powerlevel),
        },
      });
    },
  }),
);
