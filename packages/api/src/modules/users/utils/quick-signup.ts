import type { Major, QuickSignup, School } from '@prisma/client';
import { isFuture } from 'date-fns';

export function quickSignupIsValidFor(
  { validUntil, school }: QuickSignup & { school: School & { majors: Major[] } },
  majorId: string,
): boolean {
  return isFuture(validUntil) && school.majors.some(({ id }) => id === majorId);
}
