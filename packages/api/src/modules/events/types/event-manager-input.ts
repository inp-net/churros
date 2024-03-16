import { builder } from '#lib';

export const EventManagerInput = builder.inputType('EventManagerInput', {
  fields: (t) => ({
    canEdit: t.boolean(),
    canEditPermissions: t.boolean(),
    canVerifyRegistrations: t.boolean(),
    userUid: t.string(),
  }),
});
