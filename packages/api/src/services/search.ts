import { builder, prisma } from '#lib';
import type { Group, User } from '@prisma/client';
import { GraphQLError } from 'graphql';
import { fullTextSearch, type SearchResult } from '../search.js';

export const GroupSearchResultType = builder
  .objectRef<SearchResult<{ group: Group }, ['description']>>('GroupSearchResult')
  .implement({
    fields: (t) => ({
      id: t.exposeID('id'),
      group: t.prismaField({
        type: 'Group',
        resolve: (_, { group }) => group,
      }),
      rank: t.exposeFloat('rank', { nullable: true }),
      similarity: t.exposeFloat('similarity'),
      highlightedDescription: t.string({
        resolve: ({ highlights }) => highlights.description,
      }),
    }),
  });

builder.queryField('searchGroups', (t) =>
  t.field({
    type: [GroupSearchResultType],
    args: { q: t.arg.string(), similarityCutoff: t.arg.float({ required: false }) },
    authScopes: { loggedIn: true },
    async resolve(_, { q, similarityCutoff }) {
      return searchGroups(q, similarityCutoff ?? undefined);
    },
  }),
);

export const UserSearchResultType = builder
  .objectRef<SearchResult<{ user: User }, ['description']>>('UserSearchResult')
  .implement({
    fields: (t) => ({
      user: t.prismaField({
        type: 'User',
        resolve: (_, { user }) => user,
      }),
      id: t.exposeID('id'),
      similarity: t.exposeFloat('similarity'),
      rank: t.exposeFloat('rank', { nullable: true }),
      highlightedDescription: t.string({
        resolve: ({ highlights }) => highlights.description,
      }),
    }),
  });

/** Searches for user on all text fields. */
builder.queryField('searchUsers', (t) =>
  t.field({
    type: [UserSearchResultType],
    args: { q: t.arg.string(), similarityCutoff: t.arg.float({ required: false }) },
    authScopes: { student: true },
    async resolve(_, { q, similarityCutoff }) {
      return await searchUsers(q, similarityCutoff ?? undefined);
    },
  }),
);

export const MixedSearchResultType = builder.unionType('MixedSearchResult', {
  types: [UserSearchResultType, GroupSearchResultType],
  resolveType: (value) => {
    if ('user' in value) return 'UserSearchResult';
    if ('group' in value) return 'GroupSearchResult';
    throw new Error('Invalid search result');
  },
});

builder.queryField('search', (t) =>
  t.authField({
    type: [MixedSearchResultType],
    args: {
      q: t.arg.string(),
    },
    authScopes: { student: true },
    async resolve(_, { q }) {
      const results = await Promise.allSettled([searchUsers(q), searchGroups(q)]);
      if (results.some((r) => r.status !== 'fulfilled'))
        throw new GraphQLError("Une erreur s'est produite lors de la recherche.");
      const mixed = results.flatMap(
        (r) =>
          (r.status === 'fulfilled' ? r.value : []) as Array<
            SearchResult<{ group: Group } | { user: User }, ['description']>
          >,
      );
      return mixed;
    },
  }),
);

async function searchUsers(q: string, similarityCutoff = 0.08) {
  return await fullTextSearch('User', q, {
    property: 'user',
    resolveObjects: (ids) => prisma.user.findMany({ where: { id: { in: ids } } }),
    similarityCutoff,
    fuzzy: ['firstName', 'lastName', 'nickname', 'email', 'uid'],
    highlight: ['description'],
    htmlHighlights: ['description'],
  });
}

function searchGroups(q: string, similarityCutoff = 0.2) {
  return fullTextSearch('Group', q, {
    property: 'group',
    resolveObjects: (ids) => prisma.group.findMany({ where: { id: { in: ids } } }),
    similarityCutoff,
    fuzzy: ['name', 'uid'],
    highlight: ['description'],
    htmlHighlights: ['description'],
  });
}
