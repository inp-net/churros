import { prisma } from '#lib';

import { mappedGetAncestors } from 'arborist';

export async function ancestorsOfGroup<T extends { familyId?: string | null; id: string }>(
  ...groups: T[]
) {
  return (
    prisma.group
      // Get all groups in the same family as the user's groups
      .findMany({
        where: { familyId: { in: groups.map(({ id, familyId }) => familyId ?? id) } },
        select: { id: true, parentId: true, uid: true },
      })
      // Get all ancestors of the groups
      .then((gs) => mappedGetAncestors(gs, groups, { mappedKey: 'id' }))
      // Flatten the ancestors into a single array
      .then((groups) => groups.flat())
  );
}
