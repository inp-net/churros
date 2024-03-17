import { builder, prisma, prometheusClient } from '#lib';
import { resolveArrayConnection } from '@pothos/plugin-relay';
import { addWeeks, minutesToSeconds } from 'date-fns';
import { ApiUsageType } from '../types/api-usage.js';
import { ThirdPartyApp } from '../types/third-party-app.js';
import { canManageThirdPartyApp } from '../utils/permissions.js';

builder.prismaObjectField(ThirdPartyApp, 'apiUsage', (t) =>
  t.connection({
    type: ApiUsageType,
    async authScopes({ ownerId }, _, { user }) {
      const group = await prisma.group.findUniqueOrThrow({ where: { id: ownerId } });
      return canManageThirdPartyApp({ groupId: ownerId, group }, user);
    },
    async resolve({ id }, args) {
      const response = await prometheusClient.rangeQuery(
        `query_duration_ms_count{job="churros", oauth_client="${id}"}`,
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
