import { builder, environmentSchema } from '#lib';

export const SearchableResourcesEnum = builder.enumType('SearchableResources', {
  values: {
    Users: {
      description: 'Utilisateur·ices',
      value: 'Users',
    },
    Groups: {
      description: 'Groupes',
      value: 'Groups',
    },
    Events: {
      description: 'Événements',
      value: 'Events',
    },
    Articles: {
      description: 'Posts',
      value: 'Articles',
    },
    Documents: {
      description: 'Documents',
      value: 'Documents',
    },
  } satisfies Record<
    // Ensures that we update the definition of the PUBLIC_GLOBAL_SEARCH_BUMPS environment variable when adding a new value
    keyof NonNullable<typeof environmentSchema._type.PUBLIC_GLOBAL_SEARCH_BUMPS>,
    {
      description: string;
      value: string;
    }
  >,
});
