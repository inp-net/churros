import { builder } from '#lib';
import {} from '#modules/global';
import {} from '../index.js';

export const ContributionOptionType = builder.prismaObject('ContributionOption', {
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    price: t.exposeFloat('price'),
    paysFor: t.relation('paysFor'),
    offeredIn: t.relation('offeredIn'),
  }),
});
