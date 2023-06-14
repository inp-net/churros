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
  excludeIDs: string[] = []
): (results: T[]) => T[] {
  return (results: T[]) => {
    const changesCountMap = new Map<string, number>();
    for (const { id, changes } of fuzzySearchResults) changesCountMap.set(id, changes);

    const changes = (a: T) => changesCountMap.get(a.id);

    return results
      .filter(({ id }) => !excludeIDs.includes(id) && changesCountMap.get(id)! <= maxChanges)
      .sort((a: T, b: T) =>
        changes(a) !== undefined && changes(b) !== undefined ? changes(a)! - changes(b)! : 0
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
