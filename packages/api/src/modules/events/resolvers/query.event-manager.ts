import { builder, ensureGlobalId, prisma } from '#lib';
import { LocalID } from '#modules/global';
import { EventManagerType } from '../index.js';

// We need to keep a Query.eventManager and not do Event.manager because HoudiniGraphQL does not support non-Query fields for specifying custom IDs in the cache, see https://houdinigraphql.com/guides/caching-data#custom-ids

builder.queryField('eventManager', (t) =>
  t.prismaField({
    type: EventManagerType,
    args: {
      id: t.arg({ type: LocalID }),
    },
    resolve: async (query, _, { id }) => {
      id = ensureGlobalId(id, 'EventManager');
      return prisma.eventManager.findUniqueOrThrow({ ...query, where: { id } });
    },
  }),
);
