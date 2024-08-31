import { uidIsFree } from '#lib';
import dichotomid from 'dichotomid';
import slug from 'slug';
// @ts-expect-error Untyped lib
import unaccent from 'unaccent';

export const createUid = async ({
  firstName,
  lastName,
}: {
  firstName: string;
  lastName: string;
}) => {
  const toAscii = (x: string) => slug(unaccent(x)).replace('-', '');
  const base = toAscii(lastName).slice(0, 16) + toAscii(firstName).charAt(0);
  const uidFromBase = (n: number) => `${base}${n > 1 ? n : ''}`;
  const n = await dichotomid(async (n) => uidIsFree(uidFromBase(n)));
  return uidFromBase(n);
};
