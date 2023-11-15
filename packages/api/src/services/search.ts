import { log } from '../objects/logs.js';
import { prisma } from '../prisma.js';

export type FuzzySearchResult = Array<{ id: string; changes: number }>;

export const levenshteinSorter =
  (fuzzySearchResults: FuzzySearchResult) => (a: { id: string }, b: { id: string }) => {
    const aObj = fuzzySearchResults.find(({ id }) => id === a.id);
    const bObj = fuzzySearchResults.find(({ id }) => id === b.id);
    if (aObj?.changes && bObj?.changes) return aObj.changes - bObj.changes;
    return 0;
  };

export function levenshteinFilterAndSort<T extends { id: string }>(
  fuzzySearchResults: FuzzySearchResult,
  maxChanges: number,
  excludeIDs: string[] = [],
): (results: T[]) => T[] {
  return (results: T[]) => {
    const changesCountMap = new Map<string, number>();
    for (const { id, changes } of fuzzySearchResults) changesCountMap.set(id, changes);

    const changes = (a: T) => changesCountMap.get(a.id);

    return results
      .filter(({ id }) => !excludeIDs.includes(id) && changesCountMap.get(id)! <= maxChanges)
      .sort((a: T, b: T) =>
        changes(a) !== undefined && changes(b) !== undefined ? changes(a)! - changes(b)! : 0,
      );
  };
}

export function splitSearchTerms(q: string): {
  terms: Set<string>;
  numberTerms: number[];
  searchString: string;
} {
  const terms = new Set(String(q).split(' ').filter(Boolean));
  const searchString = [...terms].join('&');
  const numberTerms = [...terms].map(Number).filter((n) => !Number.isNaN(n));

  return { terms, numberTerms, searchString };
}

export function sanitizeOperators(q: string): string {
  return q.replaceAll(/[!&|]/g, ' ');
}

export const HIGHLIGHTER_OPTIONS = 'StartSel=<mark>, StopSel=</mark>';

export type FullTextMatches<highlights = {}> = Array<
  {
    id: string;
    rank: number;
    similarity: number;
  } & highlights
>;

export type FullTextMatch<columns extends readonly string[]> = {
  id: string;
  rank: number;
  similarity: number;
  highlights: Record<columns[number], string>;
};

/**
 * Search using postgres full-text search and fuzzy searches with pg_trgm.
 * The given table needs to have a tsvector column named "search"
 * @param table The table to search in
 * @param q The user query, does not have to be sanitized.
 * @param options Options for the search
 * @param options.similarityCutoff Results that have a similarity below this cutoff and no full-text search match will not be returned
 * @param options.fuzzy The columns to fuzzy search in. Must not be empty.
 * @param options.highlight The columns to highlight
 * @param options.additionalClauses An object mapping column names to the values that they have to equal.
 * @returns An array of matches, containing the id, rank of the full-text search, similarity for the fuzzy search and the highlights, and object mapping each column name to the highlighted string. Highlighted parts are surrounded by tags, respecing the HIGHLIGHTER_OPTIONS constant (see StartSel and StopSel)
 */
export async function fullTextSearch(
  table: string,
  q: string,
  {
    similarityCutoff = 0.05,
    fuzzy: fuzzySearchedColumns = [],
    highlight: highlightedColumns = [],
    additionalClauses = {},
  }: {
    similarityCutoff?: number | null | undefined;
    fuzzy: readonly string[];
    highlight: readonly string[];
    additionalClauses?: Record<string, string>;
  },
): Promise<Array<FullTextMatch<typeof highlightedColumns>>> {
  // We select id, rank, similarity, and highlights, which are named highlights_<columns>
  const selection = `"id", rank, similarity, ${highlightedColumns
    .map((c) => `highlights_${c}`)
    .join(', ')}`;

  // This is in chage of fuzzy search. We compute the similarity between the query and the columns eligible for fuzzy searching.
  if (fuzzySearchedColumns.length === 0) throw `Cannot have empty fuzzy searched columns`;
  const similarityComputation = `similarity($1, ${fuzzySearchedColumns
    .map((c) => `"${c}"`)
    .join(' || ')})`;

  // To compute the highlights, we use the ts_headline function. Each highlighted column is saved in a variable named highlights_<column>
  const highlightsComputations =
    highlightedColumns.length > 0
      ? `${highlightedColumns
          .map((c) => `ts_headline('french', "${c}", query, $2) highlights_${c}`)
          .join(', ')}`
      : '';

  const additionalFilters = [...Object.keys(additionalClauses).entries()]
    .map(([index, column]) => `"${column}" = $${index + 4}`)
    .join(' AND ');

  // WARN: do ***NOT*** use `q` (or `similarityCutoff` even if it should be parsed as a float somewhere) inside the query string, it's USER-CONTROLLED INPUT.
  // We use $1 and a prepared statement instead.
  // don't cause sql injections plz uwu
  const query = `
    SELECT
      ${selection} 
    FROM
      "${table}",
      ${similarityComputation} similarity,
      plainto_tsquery('french', $1) query,
      nullif(ts_rank_cd("search", query), 0) rank,
      ${highlightsComputations}
    WHERE
      ${additionalFilters ? `(${additionalFilters}) AND ` : ''}
      (query @@ "search" OR similarity > $3)
  `;

  const results: Array<{ id: string; rank: number; similarity: number }> =
    await prisma.$queryRawUnsafe(
      query,
      // This spread is _not_ useless, unicorn spittin some absolute BS
      // eslint-disable-next-line unicorn/no-useless-spread
      ...[q, HIGHLIGHTER_OPTIONS, similarityCutoff ?? 0.05, ...Object.values(additionalClauses)],
    );

  await log(
    'fulltext-search',
    'search',
    {
      sql: query,
      results,
      query: q,
    },
    table,
  );

  return results.map(({ id, rank, similarity, ...highlights }) => ({
    id,
    rank,
    similarity,
    highlights: Object.fromEntries(
      Object.entries(highlights).map(([k, v]) => [k.replace(/^highlights_/, ''), v as string]),
    ),
  }));
}

export function sortWithMatches<T extends { id: string }>(
  objects: T[],
  matches: Array<FullTextMatch<readonly string[]>>,
): T[] {
  return objects.sort(
    (a, b) =>
      matches.findIndex(({ id }) => id === a.id) - matches.findIndex(({ id }) => id === b.id),
  );
}
