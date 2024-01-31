import { builder } from '#lib';
import {} from '#modules/global';
import {} from '../index.js';

export enum EventManagerPowerLevel {
  ReadOnly,
  ScanTickets,
  Edit,
  EditPermissions,
}

export const EventManagerPowerLevelType = builder.enumType(EventManagerPowerLevel, {
  name: 'EventManagerPowerLevel',
});
