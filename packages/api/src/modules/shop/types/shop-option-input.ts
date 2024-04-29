import { builder } from '#lib';

export const ShopItemOptionInput = builder.inputType('ShopItemOptionInput', {
  fields: (t) => ({
    id: t.string(),
    name: t.string(),
    options: t.stringList(),
    required: t.boolean(),
    otherToggle: t.boolean(),
  }),
});
