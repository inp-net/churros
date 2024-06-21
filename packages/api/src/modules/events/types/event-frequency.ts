import { builder } from '#lib';

import { EventFrequency } from '@centraverse/db/prisma';

export const EventFrequencyType = builder.enumType(EventFrequency, {
  name: 'EventFrequency',
});
