import { builder } from '#lib';

import { finishPaypalPayment } from '../index.js';
// TODO rename to mutation.finish-paypal-booking-payment

builder.mutationField('finishPaypalRegistrationPayment', (t) =>
  t.field({
    type: 'Boolean',
    errors: {},
    args: {
      orderId: t.arg.string(),
    },
    async resolve(_, { orderId }) {
      await finishPaypalPayment(orderId);
      return true;
    },
  }),
);
