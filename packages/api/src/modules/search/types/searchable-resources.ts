import { builder } from '#lib';

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
  },
});