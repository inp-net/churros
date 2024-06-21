import { builder } from '#lib';

import { PaymentMethod } from '@centraverse/db/prisma';

export const PaymentMethodEnum = builder.enumType(PaymentMethod, {
  name: 'PaymentMethod',
});
