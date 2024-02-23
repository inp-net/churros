import { EventManagerPowerLevel } from '../index.js';

export function powerlevelToPermissions(level: EventManagerPowerLevel) {
  switch (level) {
    case EventManagerPowerLevel.ReadOnly: {
      return {
        canEdit: false,
        canEditPermissions: false,
        canVerifyRegistrations: false,
      };
    }
    case EventManagerPowerLevel.ScanTickets: {
      return {
        canEdit: true,
        canEditPermissions: false,
        canVerifyRegistrations: true,
      };
    }
    case EventManagerPowerLevel.Edit: {
      return {
        canEdit: true,
        canEditPermissions: false,
        canVerifyRegistrations: true,
      };
    }
    case EventManagerPowerLevel.EditPermissions: {
      return {
        canEdit: true,
        canEditPermissions: true,
        canVerifyRegistrations: true,
      };
    }
  }
}

export function permissionsToPowerlevel({
  canEdit,
  canEditPermissions,
  canVerifyRegistrations,
}: {
  canEdit: boolean;
  canEditPermissions: boolean;
  canVerifyRegistrations: boolean;
}): EventManagerPowerLevel {
  if (canVerifyRegistrations && canEdit && canEditPermissions)
    return EventManagerPowerLevel.EditPermissions;
  if (canVerifyRegistrations && canEdit) return EventManagerPowerLevel.Edit;
  if (canVerifyRegistrations) return EventManagerPowerLevel.ScanTickets;
  return EventManagerPowerLevel.ReadOnly;
}
