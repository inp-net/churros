import { builder } from '#lib';

export enum EventManagerPowerLevel {
  ReadOnly,
  ScanTickets,
  Edit,
  EditPermissions,
}

export const EventManagerPowerLevelNames = {
  [EventManagerPowerLevel.ReadOnly]: 'ReadOnly',
  [EventManagerPowerLevel.ScanTickets]: 'ScanTickets',
  [EventManagerPowerLevel.Edit]: 'Edit',
  [EventManagerPowerLevel.EditPermissions]: 'EditPermissions',
};

export const EventManagerPowerLevelType = builder.enumType(EventManagerPowerLevel, {
  name: 'EventManagerPowerLevel',
});
