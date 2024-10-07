import { builder, type SearchResult } from '#lib';
import { GroupMemberType } from '#modules/groups';
import type { GroupMember } from '@churros/db/prisma';

export const GroupMemberSearchResultType = builder
  .objectRef<
    SearchResult<{
      membership: GroupMember;
    }>
  >('GroupMemberSearchResult')
  .implement({
    fields: (t) => ({
      membership: t.prismaField({
        type: GroupMemberType,
        resolve: (_, { membership }) => membership,
      }),
      rank: t.exposeFloat('rank', { nullable: true }),
      similarity: t.exposeFloat('similarity'),
    }),
  });
