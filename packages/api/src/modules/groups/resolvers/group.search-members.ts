import { builder, fullTextSearch, prisma } from '#lib';
import { GroupMemberPrismaIncludes, GroupType } from '#modules/groups/types';
import { GroupMemberSearchResultType } from '../types/group-member-search-result.js';

builder.prismaObjectField(GroupType, 'searchMembers', (t) =>
  t.field({
    type: [GroupMemberSearchResultType],
    description: 'Recherche des membres du groupe',
    args: {
      q: t.arg.string(),
    },
    async resolve(group, { q }) {
      return searchGroupMembers(group, q);
    },
  }),
);

export async function searchGroupMembers(
  group: { id: string },
  q: string,
  similarityCutoff = 0.08,
) {
  return fullTextSearch('User', q, {
    property: 'membership',
    resolveObjects: (ids) =>
      prisma.groupMember
        .findMany({
          where: {
            groupId: group.id,
            memberId: { in: ids },
          },
          include: GroupMemberPrismaIncludes,
        })
        .then((memberships) =>
          memberships.map((membership) => ({
            id: membership.memberId,
            ...membership,
          })),
        ),
    similarityCutoff,
    fuzzy: ['firstName', 'lastName', 'nickname', 'email', 'uid', 'phone'],
    highlight: ['description'],
    htmlHighlights: ['description'],
  });
}
