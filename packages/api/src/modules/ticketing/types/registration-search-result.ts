import { builder, type SearchResult } from '#lib';

import type { Registration } from '@churros/db/prisma';

// TODO rename to booking-search-result

export const RegistrationSearchResultType = builder
  .objectRef<
    SearchResult<
      { registration: Registration },
      ['authorEmail', 'externalBeneficiary', 'authorFullName', 'internalBeneficiaryFullName']
    > & { byCode?: boolean }
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
      byCode: t.boolean({
        description:
          "Le résultat de recherche apparaît car le code de réservation correspond à l'entrée de recherche",
        resolve: ({ byCode }) => byCode ?? false,
      }),
    }),
  });
