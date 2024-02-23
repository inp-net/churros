import { builder } from '#lib';

import { PaymentMethod } from '@prisma/client';

export const PaymentMethodEnum = builder.enumType(PaymentMethod, {
  name: 'PaymentMethod',
});
