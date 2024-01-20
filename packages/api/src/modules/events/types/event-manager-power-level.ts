import { builder } from '#lib';

export enum EventManagerPowerLevel {
  ReadOnly,
  ScanTickets,
  Edit,
  EditPermissions,
}

export const EventManagerPowerLevelType = builder.enumType(EventManagerPowerLevel, {
  name: 'EventManagerPowerLevel',
});
