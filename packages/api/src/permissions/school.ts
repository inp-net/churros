import type { Major, User } from '@prisma/client';

export function userIsStudentOfSchool(user: User, school: { majors: Major[] }): boolean {
  return school.majors.some((major) => userIsStudentOfMajor(user, major));
}

export function userIsStudentOfMajor(user: User, major: Major): boolean {
  return user.majorId === major.id;
}
