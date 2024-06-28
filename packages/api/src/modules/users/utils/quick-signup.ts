import { prisma } from '#lib';
import type { Major, QuickSignup, School } from '@churros/db/prisma';
import { isFuture } from 'date-fns';

export function quickSignupIsValidFor(
  { validUntil, school }: QuickSignup & { school: School & { majors: Major[] } },
  majorId: string,
): boolean {
  return isFuture(validUntil) && school.majors.some(({ id }) => id === majorId);
}

export async function cleanInvalidQuickSignups() {
  await prisma.quickSignup.deleteMany({
    where: {
      validUntil: { lt: new Date() },
    },
  });
}
