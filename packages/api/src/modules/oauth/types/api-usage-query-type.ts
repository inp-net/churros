import { builder } from '#lib';

export enum ApiUsageQueryType {
  Query = 'query',
  Mutation = 'mutation',
  Subscription = 'subscription',
}

export const ApiUsageQueryTypeEnum = builder.enumType(ApiUsageQueryType, {
  name: 'ApiUsageQueryType',
  description: "Type de requête effectuée sur l'API",
  values: {
    Query: {
      description: 'Récupération de données',
    },
    Mutation: {
      description: 'Modification de données, ou autre action diverses',
    },
    Subscription: {
      description: 'Abonnement à des données pour être informé en temps réel des changements',
    },
  },
});
