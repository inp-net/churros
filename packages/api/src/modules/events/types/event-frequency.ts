import { builder } from '#lib';
import {} from '#modules/global';
import { EventFrequency } from '@prisma/client';
import {} from '../index.js';

export const EventFrequencyType = builder.enumType(EventFrequency, {
  name: 'EventFrequency',
});
