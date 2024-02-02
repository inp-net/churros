import { builder } from '#lib';

import { EventManagerPowerLevelType, permissionsToPowerlevel } from '../index.js';

export const EventManagerType = builder.prismaObject('EventManager', {
  fields: (t) => ({
    canVerifyRegistrations: t.exposeBoolean('canVerifyRegistrations'),
    canEdit: t.exposeBoolean('canEdit'),
    canEditPermissions: t.exposeBoolean('canEditPermissions'),
    event: t.relation('event'),
    user: t.relation('user'),
    power: t.field({
      type: EventManagerPowerLevelType,
      resolve(permissions) {
        return permissionsToPowerlevel(permissions);
      },
    }),
  }),
});
