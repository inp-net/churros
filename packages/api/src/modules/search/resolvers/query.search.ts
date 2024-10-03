import { builder, type SearchResult } from '#lib';
import { searchDocuments } from '#modules/documents';
import { searchEvents } from '#modules/events';
import { searchGroups } from '#modules/groups';
import { searchArticles } from '#modules/posts';
import { SearchResultType } from '#modules/search/types';
import { searchUsers } from '#modules/users';
import type { Group, User } from '@churros/db/prisma';
import { GraphQLError } from 'graphql';
import { SearchableResourcesEnum } from '../types/searchable-resources.js';

builder.queryField('search', (t) =>
  t.field({
    type: [SearchResultType],
    description: 'Rechercher des ressources (personnes, groupes, événements, articles…)',
    args: {
      q: t.arg.string({
        description: 'Le texte de recherche',
        required: false,
      }),
      only: t.arg({
        description: 'Ne rechercher que certaines ressources',
        required: false,
        type: [SearchableResourcesEnum],
      }),
    },
    authScopes: { student: true },
    async resolve(_, { q, only }, { user }) {
      if (!q) return [];
      const results = await Promise.allSettled([
        !only || only.includes('Users') ? searchUsers(q) : [],
        !only || only.includes('Groups') ? searchGroups(q) : [],
        !only || only.includes('Events') ? searchEvents(q, undefined, user) : [],
        !only || only.includes('Articles') ? searchArticles(q, undefined, user) : [],
        !only || only.includes('Documents') ? searchDocuments(q, {}) : [],
      ]);
      if (results.some((r) => r.status !== 'fulfilled'))
        throw new GraphQLError("Une erreur s'est produite lors de la recherche.");
      const mixed = results.flatMap(
        (r) =>
          (r.status === 'fulfilled' ? r.value : []) as Array<
            SearchResult<{ group: Group } | { user: User }, ['description']>
          >,
      );
      return mixed.toSorted((a, b) => b.rank - a.rank).slice(0, 200);
    },
  }),
);
