import { builder } from '#lib';

import { EventFrequency } from '@prisma/client';

export const EventFrequencyType = builder.enumType(EventFrequency, {
  name: 'EventFrequency',
});
