import { yearTier } from '#lib';
import type { Prisma } from '@churros/db/prisma';

/**
 * Maps user input replacement keys (e.g. [prenom]) to their user property keys (e.g. firstName)
 */
export const REPLACE_MAP = {
  'prénom': 'firstName',
  'nom': 'lastName',
  'nom de famille': 'lastName',
  'filière': 'major.shortName',
  'uid': 'uid',
  'promo': 'graduationYear',
  'année': 'yearTier',
} as const;

export const renderURLPrismaIncludes = {
  major: true,
} as const satisfies Prisma.UserInclude;

export function renderURL(
  value: string,
  user: null | undefined | Prisma.UserGetPayload<{ include: typeof renderURLPrismaIncludes }>,
) {
  const removeAccents = (text: string) => text.normalize('NFKD').replaceAll(/[\u0300-\u036F]/g, '');
  const accessKey = (obj: Record<string, unknown>, dotstring: string) => {
    let searchingIn: string | Record<string, unknown> | undefined = obj;

    for (const fragment of dotstring.split('.')) {
      if (!searchingIn) return;
      if (typeof searchingIn === 'string') return searchingIn;

      searchingIn = searchingIn[fragment.trim()] as Record<string, unknown> | string | undefined;
    }

    return searchingIn as unknown as string;
  };

  const wrapWithNonAccentedKeys = (o: Record<string, string>) =>
    Object.fromEntries(
      Object.entries(o).flatMap(([k, v]) => [
        [k, v],
        [removeAccents(k), v],
      ]),
    );

  const augmentedUser = user
    ? {
        ...user,
        yearTier: yearTier(user.graduationYear),
      }
    : undefined;

  for (const [humanKey, databaseKey] of Object.entries(wrapWithNonAccentedKeys(REPLACE_MAP))) {
    value = value.replaceAll(
      `[${humanKey}]`,
      encodeURIComponent(accessKey(augmentedUser ?? {}, databaseKey) ?? '') +
        (databaseKey === 'yearTier' ? 'A' : ''),
    );
  }
  return value;
}
