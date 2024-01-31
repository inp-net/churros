import { builder } from '#lib';
import {} from '#modules/global';
import {} from '../index.js';
// TODO remove, use event-manager-power-level and user's uid instead.

export const ManagerOfEventInput = builder.inputType('ManagerOfEventInput', {
  fields: (t) => ({
    userUid: t.field({ type: 'String' }),
    canEdit: t.field({ type: 'Boolean' }),
    canEditPermissions: t.field({ type: 'Boolean' }),
    canVerifyRegistrations: t.field({ type: 'Boolean' }),
  }),
});
