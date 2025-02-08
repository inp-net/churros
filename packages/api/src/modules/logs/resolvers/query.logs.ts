import { builder, prisma } from '#lib';
import { UIDScalar } from '#modules/global';
import { GraphQLError } from 'graphql';
import { LogType } from '../index.js';

builder.queryField('logs', (t) =>
  t.prismaConnection({
    type: LogType,
    cursor: 'id',
    args: {
      user: t.arg({
        type: UIDScalar,
        description: 'Limiter les logs à ceux effectués par une certaine personne',
        required: false,
      }),
      area: t.arg.string({
        description: 'Filtrer par zone',
        required: false,
      }),
      action: t.arg.string({
        description: 'Filtrer par action',
        required: false,
      }),
      message: t.arg.string({
        description: "Filtrer dans le message de l'entrée de log",
        required: false,
      }),
      target: t.arg.string({
        description: 'Filtrer par cible',
        required: false,
      }),
    },
    authScopes: { admin: true },
    async resolve(query, _, { user, area, message, action, target }, { user: me }) {
      if (!me) throw new GraphQLError('User not found');
      return prisma.logEntry.findMany({
        ...query,
        where: {
          user: user ? { uid: user } : undefined,
          area: area ? { search: area } : undefined,
          action: action ? { search: action } : undefined,
          message: message ? { search: message } : undefined,
          target: target || undefined,
        },
        include: {
          user: true,
        },
        orderBy: {
          happenedAt: 'desc',
        },
      });
    },
  }),
);
