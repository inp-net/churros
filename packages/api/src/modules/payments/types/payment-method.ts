import { builder } from '#lib';

import { PaymentMethod } from '@churros/db/prisma';

export const PaymentMethodEnum = builder.enumType(PaymentMethod, {
  name: 'PaymentMethod',
  values: {
    Card: {
      description: 'Carte bancaire',
    },
    Cash: {
      description: 'Espèces',
    },
    Check: {
      description: 'Chèque',
    },
    Lydia: {
      description: 'Lydia',
    },
    Other: {
      description: 'Autre',
    },
    PayPal: {
      description: 'PayPal',
      deprecationReason: 'Non implémenté',
    },
    Transfer: {
      description: 'Virement',
    },
    External: {
      description: 'Paiement externe à Churros',
    },
  },
});
