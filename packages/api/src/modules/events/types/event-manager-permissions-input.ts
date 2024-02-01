import { builder } from '#lib';

// TODO remove, use event-manager-power-level and user's uid instead.

export const EventManagerPermissionsInput = builder.inputType('EventManagerPermissionsInput', {
  fields: (t) => ({
    canEdit: t.field({ type: 'Boolean' }),
    canEditPermissions: t.field({ type: 'Boolean' }),
    canVerifyRegistrations: t.field({ type: 'Boolean' }),
  }),
});
