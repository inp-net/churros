import { builder, ensureGlobalId, prisma } from '#lib';
import { LocalID } from '#modules/global';
import { LogType } from '../types/log-entry.js';

builder.queryField('log', (t) =>
  t.prismaField({
    type: LogType,
    nullable: true,
    description: 'Récupérer un log par son ID',
    args: {
      id: t.arg({
        type: LocalID,
        description: 'ID du log à récupérer',
      }),
    },
    resolve(query, _, { id }) {
      return prisma.logEntry.findUnique({
        ...query,
        where: { id: ensureGlobalId(id, 'LogEntry') },
      });
    },
  }),
);
