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
