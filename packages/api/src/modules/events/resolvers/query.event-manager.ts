import { builder, prisma } from '#lib';

import { EventManagerType } from '../index.js';
// TODO rename to event.manager

builder.queryField('eventManager', (t) =>
  t.prismaField({
    type: EventManagerType,
    args: {
      user: t.arg.string(),
      eventId: t.arg.id(),
    },
    resolve: async (query, _, { user, eventId }) =>
      prisma.eventManager.findFirstOrThrow({ ...query, where: { user: { uid: user }, eventId } }),
  }),
);
