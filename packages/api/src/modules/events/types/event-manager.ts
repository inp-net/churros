import { EventManagerPowerLevel, EventManagerPowerLevelType } from '../index.js';
import {} from '#modules/global';
import { builder } from '#lib';

export const EventManagerType = builder.prismaObject('EventManager', {
  fields: (t) => ({
    canVerifyRegistrations: t.exposeBoolean('canVerifyRegistrations'),
    canEdit: t.exposeBoolean('canEdit'),
    canEditPermissions: t.exposeBoolean('canEditPermissions'),
    event: t.relation('event'),
    user: t.relation('user'),
    power: t.field({
      type: EventManagerPowerLevelType,
      resolve({ canVerifyRegistrations, canEdit, canEditPermissions }) {
        if (canVerifyRegistrations && canEdit && canEditPermissions)
          return EventManagerPowerLevel.EditPermissions;
        if (canVerifyRegistrations && canEdit) return EventManagerPowerLevel.Edit;
        if (canVerifyRegistrations) return EventManagerPowerLevel.ScanTickets;
        return EventManagerPowerLevel.ReadOnly;
      },
    }),
  }),
});
