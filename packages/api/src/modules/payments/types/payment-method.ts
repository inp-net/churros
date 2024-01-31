import { builder } from '#lib';
import {} from '#modules/global';
import { PaymentMethod } from '@prisma/client';
import {} from '../index.js';

export const PaymentMethodEnum = builder.enumType(PaymentMethod, {
  name: 'PaymentMethod',
});
