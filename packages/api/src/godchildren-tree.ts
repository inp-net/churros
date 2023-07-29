import type { User } from '@prisma/client';
import { prisma } from './prisma.js';
import { GraphQLError } from 'graphql';

export class FamilyTree {
  nesting: string; // This is ugly. JSON-stringified list of (list of (...) | string) containig the nesting of user uids
  users: User[];

  constructor(nesting: string, users: User[]) {
    this.nesting = nesting;
    this.users = users;
  }
}

export async function getFamilyTree({
  id,
  godparentId,
}: {
  id: string;
  godparentId: string | undefined;
}): Promise<FamilyTree> {
  // Climb up
  const visitedUsers = [] as string[];
  async function parentId(id: string): Promise<string | undefined> {
    console.log(`Getting parent of ${id}, visited users are ${visitedUsers.join(' ')}`);
    const user = await prisma.user.findUniqueOrThrow({ where: { id } });
    if (visitedUsers.includes(user.uid))
      throw new GraphQLError('Cannot have cycles in the family tree');
    visitedUsers.push(user.uid);
    return user.godparentId ?? undefined;
  }

  let ultimateParentId = id;
  let parentOfUltimate = godparentId ?? undefined;
  while ((parentOfUltimate = await parentId(ultimateParentId))) ultimateParentId = parentOfUltimate;

  const ultimateParent = await prisma.user.findUnique({ where: { id: ultimateParentId } });
  if (!ultimateParent) throw new Error('Unreachable');

  // Go down, gather all children
  // Nesting is [current, children]
  type Nesting = [string, Nesting[]];
  let users = [ultimateParent];
  async function gather(rootUid: string): Promise<Nesting> {
    const parent = await prisma.user.findUniqueOrThrow({
      where: { uid: rootUid },
      include: { godchildren: true },
    });

    users = [...users, ...parent.godchildren];

    // eslint-disable-next-line
    // @ts-ignore
    return [rootUid, await Promise.all(parent.godchildren.map(async (u) => gather(u.uid)))];
  }

  const nesting = await gather(ultimateParent.uid);

  return new FamilyTree(JSON.stringify(nesting), users);
}
