import { builder, prisma, splitID, subscriptionName } from '#lib';
import { LogType } from '../../logs/types/log-entry.js';
import { ThirdPartyApp } from '../types/third-party-app.js';
import { canManageThirdPartyApp } from '../utils/permissions.js';

builder.prismaObjectField(ThirdPartyApp, 'logs', (t) =>
  t.prismaConnection({
    type: LogType,
    cursor: 'id',
    description:
      "Logs de connexion de l'application tierce, utile pour débugger des problèmes. Mise à jour en temps réel disponible via une subscription sur la query `thirdPartyApp`.",
    subscribe(subs, { id }) {
      subs.register(subscriptionName(id, 'updated'));
    },
    async authScopes({ ownerId }, _, { user }) {
      const group = await prisma.group.findUniqueOrThrow({ where: { id: ownerId } });
      return canManageThirdPartyApp({ groupId: ownerId, group }, user);
    },
    async resolve(query, { id }) {
      return prisma.logEntry.findMany({
        ...query,
        where: {
          target: {
            in: [id, splitID(id)[1]],
          },
          area: 'oauth',
        },
        orderBy: { happenedAt: 'desc' },
      });
    },
  }),
);
