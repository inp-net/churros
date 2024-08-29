import type { Prisma } from '@churros/db/prisma';

export const prismaOrderUserMemberships = [
  { president: 'desc' },
  { vicePresident: 'desc' },
  { treasurer: 'desc' },
  { secretary: 'desc' },
  { group: { type: 'asc' } },
  { title: 'asc' },
] as const satisfies Prisma.GroupMemberFindManyArgs['orderBy'];

export const prismaOrderGroupMemberships = [
  { president: 'desc' },
  { vicePresident: 'desc' },
  { treasurer: 'desc' },
  { secretary: 'desc' },
  { title: 'asc' },
] as const satisfies Prisma.GroupMemberFindManyArgs['orderBy'];
