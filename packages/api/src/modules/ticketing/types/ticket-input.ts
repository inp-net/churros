import { builder } from '#lib';
import { DateTimeScalar } from '#modules/global';
import { LinkInput } from '#modules/links';
import { PaymentMethodEnum } from '#modules/payments';
// import type { PaymentMethod } from '@prisma/client';
// import { isAfter } from 'date-fns';

export const TicketInput = builder.inputType('TicketInput', {
  // gives out a bunch of type errors, even with assertions
  // validate: [
  //   [
  //     ({ opensAt, closesAt }) =>
  //       !opensAt || !closesAt || isAfter(closesAt as Date, opensAt as Date),
  //     {
  //       message: "La date de fermeture doit être après la date d'ouverture",
  //       path: ['opensAt'],
  //     },
  //   ],
  //   [
  //     ({ price, allowedPaymentMethods }) =>
  //       !price || (allowedPaymentMethods as PaymentMethod[]).length > 0,
  //     {
  //       message: 'Un billet payant doit avoir au moins un moyen de paiement autorisé',
  //       path: ['allowedPaymentMethods'],
  //     },
  //   ],
  // ],
  fields: (t) => ({
    allowedPaymentMethods: t.field({ type: [PaymentMethodEnum] }),
    capacity: t.int(),
    price: t.float(),
    opensAt: t.field({ type: DateTimeScalar, required: false }),
    closesAt: t.field({ type: DateTimeScalar, required: false }),
    description: t.string(),
    godsonLimit: t.int(),
    links: t.field({ type: [LinkInput] }),
    name: t.string({ defaultValue: 'Place', validate: { minLength: 1 } }),
    onlyManagersCanProvide: t.boolean(),
    openToAlumni: t.boolean({ required: false }),
    openToExternal: t.boolean({ required: false }),
    openToGroups: t.stringList(),
    openToContributors: t.boolean({ required: false }),
    openToPromotions: t.intList(),
    openToSchools: t.stringList(),
    openToMajors: t.stringList(),
    openToApprentices: t.boolean({ required: false }),
    autojoinGroups: t.stringList(),
    groupName: t.string({ required: false }),
    order: t.int({ defaultValue: 0 }),
  }),
});
