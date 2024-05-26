import type { decodeGlobalID } from '#lib';

export const REACTABLE_TYPES = ['Document', 'Article', 'Comment', 'Event'] as const satisfies Array<
  ReturnType<typeof decodeGlobalID>['typename']
>;
