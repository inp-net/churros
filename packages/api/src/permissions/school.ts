import type { Context } from '#lib';
import type { Major, User } from '@churros/db/prisma';

export function userIsStudent(
  user: Context['user'],
): user is NonNullable<
  Context['user'] & { majorId: string; major: NonNullable<NonNullable<Context['user']>['major']> }
> {
  return Boolean(user && user.majorId !== null);
}

export function userIsStudentOfSchool(user: User, school: { majors: Major[] }): boolean {
  return school.majors.some((major) => userIsStudentOfMajor(user, major));
}

export function userIsStudentOfMajor(user: User, major: Major): boolean {
  return user.majorId === major.id;
}
