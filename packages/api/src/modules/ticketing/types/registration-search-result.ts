import { builder, type SearchResult } from '#lib';

import type { Registration } from '@prisma/client';

// TODO rename to booking-search-result

export const RegistrationSearchResultType = builder
  .objectRef<
    SearchResult<{ registration: Registration }, ['beneficiary']>
  >('RegistrationSearchResult')
  .implement({
    fields: (t) => ({
      id: t.exposeID('id'),
      registration: t.prismaField({
        type: 'Registration',
        resolve: (_, { registration }) => registration,
      }),
      rank: t.exposeFloat('rank', { nullable: true }),
      similarity: t.exposeFloat('similarity'),
      highlightedBeneficiary: t.string({
        resolve: ({ highlights }) => highlights.beneficiary,
      }),
    }),
  });
