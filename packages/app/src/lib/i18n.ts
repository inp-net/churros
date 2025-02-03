import { loaded, type MaybeLoading } from '$lib/loading';

const SENTENCE_JOINS = {
  fr: {
    and: 'et',
    or: 'ou',
  },
  en: {
    and: 'and',
    or: 'or',
  },
};

// TODO
const LOCALE = 'fr';

export function sentenceJoin(
  strings: string[],
  last: keyof (typeof SENTENCE_JOINS)[keyof typeof SENTENCE_JOINS] = 'and',
): string {
  const join = SENTENCE_JOINS[LOCALE][last];
  if (strings.length <= 1) return strings[0] || '';
  if (strings.length === 2) return strings.join(` ${join} `);
  return `${strings.slice(0, -1).join(', ')} ${join} ${strings.at(-1)}`;
}

/**
 * Ensures that some text is not longer than a certain length. Might do some smart things like not cutting words in half, idk yet.
 * @param str the string
 * @param maxLength max length
 * @returns the truncated string
 */
export function ellipsis(str: string, maxLength: number): string;
export function ellipsis(str: MaybeLoading<string>, maxLength: number): MaybeLoading<string>;
export function ellipsis(str: MaybeLoading<string>, maxLength: number): MaybeLoading<string> {
  if (!loaded(str)) return str;
  if (!str) return str;
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 1) + '…';
}

/**
 * Pluralize a word or noun phrase
 * @param singular singular form
 * @param count count of objects
 * @param plural plural form - default is to add 's' to every word of the singular form
 * @returns the singular or plural form, depending on count's value
 */
export function pluralize(singular: string, count: number, plural?: string): string {
  // if (LOCALE === 'en') return count === 1 ? singular : plural;
  if (LOCALE === 'fr') {
    plural ??= singular
      .split(' ')
      .map((word) => word + 's')
      .join(' ');
    return count > 1 ? plural : singular;
  }
  return singular;
}

/**
 * Display an amount of things
 * @param thing the thing to count
 * @param count the amount of things there is
 * @returns a sentence part that says how many things there are
 */
export function countThing(thing: string, count: MaybeLoading<number>): string {
  if (!loaded(count)) return `… ${pluralize(thing, 2)}`;
  return `${count} ${pluralize(thing, count)}`;
}
