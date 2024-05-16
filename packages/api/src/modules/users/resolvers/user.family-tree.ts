import { builder, prisma } from '#lib';
import { GraphQLError } from 'graphql';
import { FamilyTree } from '../types/family-tree.js';
import { UserType } from '../types/user.js';

builder.objectField(UserType, 'familyTree', (t) =>
  t.field({
    type: FamilyTree,
    resolve: ({ id, godparentId }) => getFamilyTree({ id, godparentId: godparentId ?? undefined }),
  }),
);

export async function getFamilyTree({ id, godparentId }: { id: string; godparentId?: string }) {
  // Climb up
  const visitedUsers = [] as string[];
  async function parentId(id: string): Promise<string | undefined> {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id },
    });
    if (visitedUsers.includes(user.uid))
      throw new GraphQLError('Cannot have cycles in the family tree');
    visitedUsers.push(user.uid);
    return user.godparentId ?? undefined;
  }

  let ultimateParentId = id;
  let parentOfUltimate = godparentId ?? undefined;
  while ((parentOfUltimate = await parentId(ultimateParentId))) ultimateParentId = parentOfUltimate;

  const ultimateParent = await prisma.user.findUnique({
    where: { id: ultimateParentId },
    include: {
      canEditGroups: true,
      adminOfStudentAssociations: true,
    },
  });
  if (!ultimateParent) throw new Error('Unreachable');

  // Go down, gather all children
  // Nesting is [current, children]
  type Nesting = [string, Nesting[]];
  let users = [ultimateParent];
  async function gather(rootUid: string): Promise<Nesting> {
    const parent = await prisma.user.findUniqueOrThrow({
      where: { uid: rootUid },
      include: {
        godchildren: {
          include: {
            canEditGroups: true,
            adminOfStudentAssociations: true,
          },
        },
        canEditGroups: true,
        adminOfStudentAssociations: true,
      },
    });

    users = [...users, ...parent.godchildren];

    // eslint-disable-next-line
    // @ts-ignore
    return [rootUid, await Promise.all(parent.godchildren.map(async (u) => gather(u.uid)))];
  }

  const nesting = await gather(ultimateParent.uid);

  return new FamilyTree(JSON.stringify(nesting), users);
}
