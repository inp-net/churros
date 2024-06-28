import { builder } from '#lib';

import { PaymentMethod } from '@churros/db/prisma';

export const PaymentMethodEnum = builder.enumType(PaymentMethod, {
  name: 'PaymentMethod',
});
