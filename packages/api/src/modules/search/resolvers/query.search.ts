import { builder, type SearchResult } from '#lib';
import { searchDocuments } from '#modules/documents';
import { searchEvents } from '#modules/events';
import { searchGroups } from '#modules/groups';
import { searchArticles } from '#modules/posts';
import {
  SearchableResourcesEnum,
  SearchableResourcesEnumConfig,
  SearchResultType,
} from '#modules/search';
import { searchUsers } from '#modules/users';
import type { Group, User } from '@churros/db/prisma';
import { GraphQLError } from 'graphql';
import { z } from 'zod';

// TODO: valid entire env vars with zod, see !165
const rankBumps = await new Promise<
  Partial<Record<keyof typeof SearchableResourcesEnumConfig, number>>
>((resolve) => {
  const result = z
    .string()
    .transform((x, ctx) => {
      // See https://github.com/colinhacks/zod/issues/2918#issuecomment-1800824755
      try {
        return JSON.parse(x);
      } catch (error) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: `Invalid JSON: ${error}` });
        return z.NEVER;
      }
    })
    .pipe(
      z
        .object(
          Object.fromEntries(
            Object.keys(SearchableResourcesEnumConfig).map((key) => [key, z.number()]),
          ) as Record<keyof typeof SearchableResourcesEnumConfig, z.ZodNumber>,
        )
        .partial(),
    )
    .describe(
      "Additive modifier for favoring some types in global search results. A search result's rank is between 0 and 1. JSON object mapping types to rank bumps. Types are values of the `SearchResultType` GraphQL enum. Omitting a value means no bump.",
    )
    .safeParse(process.env.PUBLIC_GLOBAL_SEARCH_BUMPS || '{}');

  if (result.success) {resolve(result.data);}
  else {
    console.warn(
      `PUBLIC_GLOBAL_SEARCH_BUMPS is invalid, defaulting to no bumps. Validation errors: ${result.error}. Value: ${process.env.PUBLIC_GLOBAL_SEARCH_BUMPS}`,
    );
    resolve({});
  }
});

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

      // Prefer user and group results by bumping their ranks
      // rank ∈ [0, 1], so bumping to 0.5 kinda ensures only _really_ relevant posts or events are shown before all user and group results
      function bumpRanks(res: ((typeof results)[number] & { status: 'fulfilled' })['value']) {
        return res.map((result) => {
          if (rankBumps.Users && 'user' in result) result.rank += rankBumps.Users;
          if (rankBumps.Groups && 'group' in result) result.rank += rankBumps.Groups;
          if (rankBumps.Events && 'event' in result) result.rank += rankBumps.Events;
          if (rankBumps.Articles && 'article' in result) result.rank += rankBumps.Articles;
          if (rankBumps.Documents && 'document' in result) result.rank += rankBumps.Documents;
          return result;
        });
      }

      const mixed = results.flatMap(
        (r) =>
          (r.status === 'fulfilled' ? bumpRanks(r.value) : []) as Array<
            SearchResult<{ group: Group } | { user: User }, ['description']>
          >,
      );
      return mixed.toSorted((a, b) => b.rank - a.rank).slice(0, 200);
    },
  }),
);
