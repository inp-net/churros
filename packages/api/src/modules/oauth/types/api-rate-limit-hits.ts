import { builder, prisma } from '#lib';
import { DateTimeScalar } from '#modules/global';
import { UserType } from '#modules/users';

type ApiRateLimitHits = {
  date: Date;
  count: number;
  query_name: string;
  query_type: string;
  user_id: string;
};

export const ApiRateLimitHitType = builder
  .objectRef<ApiRateLimitHits>('ApiRateLimitHits')
  .implement({
    description:
      "Des données temporelles pour construire des graphiques d'atteintes de rate limiting. La résolution temporelle est d'une minute.",
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
        description: "Le nombre d'erreurs de rate-limiting à cette date",
      }),
      queryName: t.exposeString('query_name', {
        description: 'Le nom de la query ou mutation ou subscription',
      }),
      queryType: t.string({
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
