import { builder, prisma } from '#lib';
import { DateTimeScalar } from '#modules/global';
import { UserType } from '#modules/users';
import { ApiUsageQueryType, ApiUsageQueryTypeEnum } from './api-usage-query-type.js';

type ApiUsage = {
  date: Date;
  count: number;
  query_name: string;
  query_type: ApiUsageQueryType;
  user_id: string;
};

export const ApiUsageType = builder.objectRef<ApiUsage>('ApiUsage').implement({
  description:
    "Des données temporelles pour construire des graphiques d'utilisation de l'API au cours du temps. La résolution temporelle est d'une minute.",
  fields: (t) => ({
    date: t.expose('date', {
      type: DateTimeScalar,
      description: 'La date à laquelle les requêtes ont été faites',
    }),
    timestamp: t.int({
      resolve({ date }) {
        return date.getTime();
      },
    }),
    count: t.exposeInt('count', {
      description: 'Le nombre de requêtes faites à cette date',
    }),
    queryName: t.exposeString('query_name', {
      description: 'Le nom de la query ou mutation ou subscription',
    }),
    queryType: t.field({
      type: ApiUsageQueryTypeEnum,
      description: 'Le type de requête effectuée',
      resolve({ query_type }) {
        return query_type;
      },
    }),
    user: t.prismaField({
      type: UserType,
      nullable: true,
      async resolve(query, { user_id }) {
        return prisma.user.findUnique({ ...query, where: { id: user_id } });
      },
    }),
  }),
});
