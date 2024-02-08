import { builder } from '#lib';
import { DateTimeScalar } from '#modules/global';
import { LinkInput } from '#modules/links';
import { PaymentMethodEnum } from '#modules/payments';
import { isAfter } from 'date-fns';

export const TicketInput = builder.inputType('TicketInput', {
  validate: [
    [
      ({ opensAt, closesAt }) => !opensAt || !closesAt || isAfter(closesAt, opensAt),
      {
        message: "La date de fermeture doit être après la date d'ouverture",
        path: ['opensAt'],
      },
    ],
    [
      ({ price, allowedPaymentMethods }) => !price || allowedPaymentMethods.length > 0,
      {
        message: 'Un billet payant doit avoir au moins un moyen de paiement autorisé',
        path: ['allowedPaymentMethods'],
      },
    ],
  ],
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
    openToGroups: t.field({ type: ['String'] }),
    openToContributors: t.boolean({ required: false }),
    openToPromotions: t.field({ type: ['Int'] }),
    openToSchools: t.field({ type: ['String'] }),
    openToMajors: t.field({ type: ['String'] }),
    openToApprentices: t.boolean({ required: false }),
    autojoinGroups: t.field({ type: ['String'] }),
    groupName: t.string({ required: false }),
    order: t.int({ defaultValue: 0 }),
  }),
});
