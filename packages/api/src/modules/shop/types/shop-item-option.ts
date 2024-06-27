import { builder } from '#lib';

export const ShopItemOptionType = builder.prismaObject('ShopItemOption', {
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    shopItem: t.relation('shopItem'),
    options: t.exposeStringList('options'),
    required: t.exposeBoolean('required'),
    otherToggle: t.exposeBoolean('otherToggle'),
  }),
});
