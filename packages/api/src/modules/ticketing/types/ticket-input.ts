import { builder } from '#lib';
import { DateTimeScalar } from '#modules/global';
import { LinkInput } from '#modules/links';
import { PaymentMethodEnum } from '#modules/payments';

export const TicketInput = builder.inputType('TicketInput', {
  fields: (t) => ({
    allowedPaymentMethods: t.field({ type: [PaymentMethodEnum] }),
    capacity: t.int(),
    price: t.float(),
    opensAt: t.field({ type: DateTimeScalar, required: false }),
    closesAt: t.field({ type: DateTimeScalar, required: false }),
    description: t.string(),
    godsonLimit: t.int(),
    links: t.field({ type: [LinkInput] }),
    name: t.string(),
    onlyManagersCanProvide: t.boolean(),
    openToAlumni: t.boolean({ required: false }),
    openToExternal: t.boolean({ required: false }),
    openToGroups: t.field({ type: ['String'] }),
    openToContributors: t.boolean({ required: false }),
    openToPromotions: t.field({ type: ['Int'] }),
    openToSchools: t.field({ type: ['String'] }),
    openToMajors: t.field({ type: ['String'] }),
    openToApprentices: t.boolean({ required: false }),
    id: t.id({ required: false }),
    autojoinGroups: t.field({ type: ['String'] }),
    groupName: t.string({ required: false }),
  }),
});
