import { builder, prisma, prometheusClient } from '#lib';
import { resolveArrayConnection } from '@pothos/plugin-relay';
import { addWeeks, minutesToSeconds } from 'date-fns';
import { ApiRateLimitHitType, ThirdPartyApp } from '../types/index.js';
import { canManageThirdPartyApp } from '../utils/index.js';

builder.prismaObjectField(ThirdPartyApp, 'rateLimitHits', (t) =>
  t.connection({
    type: ApiRateLimitHitType,
    async authScopes({ ownerId }, _, { user }) {
      const group = await prisma.group.findUniqueOrThrow({ where: { id: ownerId } });
      return canManageThirdPartyApp({ groupId: ownerId, group }, user);
    },
    async resolve({ id }, args) {
      const response = await prometheusClient.rangeQuery(
        `rate_limit_hit_penalty_ms_count{job="churros", oauth_client="${id}"}`,
        addWeeks(new Date(), -1),
        new Date(),
        minutesToSeconds(1),
      );
      if (response.resultType === 'matrix') {
        return resolveArrayConnection(
          { args },
          response.result
            .flatMap(({ values, metric: { labels } }) =>
              values.map((v: { time: Date; value: number }) => ({
                date: v.time,
                count: v.value,
                query_name: `${labels.query_type}.${labels.query_name}`,
              })),
            )
            .sort((a, b) => a.date.getTime() - b.date.getTime()),
        );
      }
      return resolveArrayConnection({ args }, []);
    },
  }),
);
