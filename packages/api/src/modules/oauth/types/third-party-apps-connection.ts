import { builder } from '#lib';
import { ThirdPartyApp } from '../index.js';

export const ThirdPartyAppsConnection = builder.connectionObject({
  name: 'ThirdPartyAppsConnection',
  type: ThirdPartyApp,
});
